import { createServerFn } from "@tanstack/react-start";
import { addDays, endOfDay } from "date-fns";
import { z } from "zod";

import { requireAuth } from "@/integrations/mongo/auth-middleware";
import { toIso } from "@/integrations/mongo/client.server";
import type { Reminder, ReminderBuckets, ReminderSource, ReminderStatus, ReminderType } from "@/lib/reminders";

const TYPE_LABELS: Record<ReminderType, string> = {
  meeting: "Meeting",
  call: "Call",
  send_proposal: "Send Proposal",
  send_quotation: "Send Quotation",
  whatsapp_followup: "WhatsApp Follow-up",
  payment_followup: "Payment Follow-up",
  general_task: "Other",
};

type Actor = { userId: string; isAdmin: boolean };

const reminderTypeEnum = z.enum([
  "meeting",
  "call",
  "send_proposal",
  "send_quotation",
  "whatsapp_followup",
  "payment_followup",
  "general_task",
]);

const sourceEnum = z.enum(["dashboard", "contact", "project", "manual", "automation"]);

function asReminder(doc: Record<string, unknown>, names?: { contact?: string; project?: string }): Reminder {
  return {
    id: String(doc._id ?? doc.id),
    type: doc.type as ReminderType,
    title: String(doc.title ?? ""),
    contact_id: String(doc.contact_id),
    contact_name: names?.contact ?? (doc.contact_name as string | null) ?? null,
    project_id: (doc.project_id as string | null) ?? null,
    project_name: names?.project ?? (doc.project_name as string | null) ?? null,
    assigned_to: String(doc.assigned_to),
    due_at: toIso(doc.due_at),
    notes: (doc.notes as string | null) ?? null,
    status: (doc.status as ReminderStatus) ?? "pending",
    source: (doc.source as ReminderSource) ?? "manual",
    notify_before_minutes: Number(doc.notify_before_minutes ?? 30),
    google_event_id: (doc.google_event_id as string | null) ?? null,
    created_by: String(doc.created_by ?? ""),
    created_at: toIso(doc.created_at),
    updated_at: toIso(doc.updated_at),
    completed_at: doc.completed_at ? toIso(doc.completed_at) : null,
    cancelled_at: doc.cancelled_at ? toIso(doc.cancelled_at) : null,
  };
}

async function accessibleContactIds(db: import("mongodb").Db, actor: Actor) {
  if (actor.isAdmin) return null;
  const { col } = await import("@/integrations/mongo/client.server");
  const rows = await col(db, "contacts")
    .find({ assigned_to: actor.userId })
    .project({ _id: 1 })
    .toArray();
  return new Set(rows.map((r) => String(r._id)));
}

async function reminderFilter(db: import("mongodb").Db, actor: Actor) {
  if (actor.isAdmin) return {};
  const contacts = await accessibleContactIds(db, actor);
  return {
    $or: [
      { assigned_to: actor.userId },
      ...(contacts && contacts.size ? [{ contact_id: { $in: [...contacts] } }] : []),
    ],
  };
}

async function assertCanAccessContact(db: import("mongodb").Db, actor: Actor, contactId: string) {
  const { col } = await import("@/integrations/mongo/client.server");
  const contact = await col(db, "contacts").findOne({ _id: contactId });
  if (!contact) throw new Error("Contact not found");
  if (!actor.isAdmin && contact.assigned_to !== actor.userId) throw new Error("Forbidden");
  return contact;
}

async function enrich(db: import("mongodb").Db, docs: Record<string, unknown>[]) {
  const { col } = await import("@/integrations/mongo/client.server");
  const contactIds = [...new Set(docs.map((d) => String(d.contact_id)).filter(Boolean))];
  const projectIds = [...new Set(docs.map((d) => d.project_id).filter(Boolean).map(String))];
  const contacts = contactIds.length
    ? await col(db, "contacts")
        .find({ _id: { $in: contactIds } })
        .project({ name: 1 })
        .toArray()
    : [];
  const projects = projectIds.length
    ? await col(db, "projects")
        .find({ _id: { $in: projectIds } })
        .project({ name: 1 })
        .toArray()
    : [];
  const cMap = Object.fromEntries(contacts.map((c) => [String(c._id), String(c.name)]));
  const pMap = Object.fromEntries(projects.map((p) => [String(p._id), String(p.name)]));
  return docs.map((d) =>
    asReminder(d, {
      contact: cMap[String(d.contact_id)],
      project: d.project_id ? pMap[String(d.project_id)] : undefined,
    }),
  );
}

/** Optional Calendar hook — best-effort; never throws. */
async function maybeSyncCalendar(
  action: "create" | "update" | "cancel" | "delete",
  userId: string,
  reminder: Record<string, unknown>,
  addToCalendar?: boolean,
) {
  try {
    const { syncReminderCalendar } = await import("@/lib/google-calendar.server");
    return await syncReminderCalendar(action, userId, reminder, addToCalendar);
  } catch (err) {
    console.error("[maybeSyncCalendar]", err);
    return reminder;
  }
}

export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const filter = await reminderFilter(db, context);
    const rows = await col(db, "reminders").find(filter).sort({ due_at: 1 }).limit(2000).toArray();
    return enrich(db, rows as Record<string, unknown>[]);
  });

export const listReminderBuckets = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const filter = await reminderFilter(db, context);
    const now = new Date();
    const todayEnd = endOfDay(now);
    const upcomingEnd = addDays(todayEnd, 7);

    const pending = await col(db, "reminders")
      .find({ ...filter, status: "pending" })
      .sort({ due_at: 1 })
      .limit(500)
      .toArray();

    const enriched = await enrich(db, pending as Record<string, unknown>[]);
    const buckets: ReminderBuckets = { overdue: [], dueToday: [], upcoming: [] };
    for (const r of enriched) {
      const due = new Date(r.due_at);
      if (due < now) buckets.overdue.push(r);
      else if (due <= todayEnd) buckets.dueToday.push(r);
      else if (due <= upcomingEnd) buckets.upcoming.push(r);
    }
    buckets.overdue = buckets.overdue.slice(0, 20);
    buckets.dueToday = buckets.dueToday.slice(0, 20);
    buckets.upcoming = buckets.upcoming.slice(0, 20);
    return buckets;
  });

export const createReminder = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        type: reminderTypeEnum,
        title: z.string().max(200).optional(),
        contact_id: z.string().min(1),
        project_id: z.string().nullable().optional(),
        assigned_to: z.string().min(1).optional(),
        due_at: z.string().min(1),
        notes: z.string().max(4000).nullable().optional(),
        source: sourceEnum.optional(),
        add_to_calendar: z.boolean().optional(),
        notify: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    await assertCanAccessContact(db, context, data.contact_id);
    const id = crypto.randomUUID();
    const now = new Date();
    const title = data.title?.trim() || TYPE_LABELS[data.type];
    let doc: Record<string, unknown> = {
      _id: id,
      id,
      type: data.type,
      title,
      contact_id: data.contact_id,
      project_id: data.project_id ?? null,
      assigned_to: data.assigned_to ?? context.userId,
      due_at: new Date(data.due_at),
      notes: data.notes?.trim() || null,
      status: "pending",
      source: data.source ?? "manual",
      notify_before_minutes: data.notify === false ? 0 : 30,
      notification_sent_at: null,
      overdue_notified_at: null,
      google_event_id: null,
      google_calendar_id: null,
      created_by: context.userId,
      created_at: now,
      updated_at: now,
      completed_at: null,
      cancelled_at: null,
    };
    doc = await maybeSyncCalendar("create", String(doc.assigned_to), doc, data.add_to_calendar);
    await col(db, "reminders").insertOne(doc as never);
    const [out] = await enrich(db, [doc]);
    return out;
  });

export const updateReminder = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        type: reminderTypeEnum.optional(),
        title: z.string().max(200).optional(),
        contact_id: z.string().min(1).optional(),
        project_id: z.string().nullable().optional(),
        assigned_to: z.string().min(1).optional(),
        due_at: z.string().min(1).optional(),
        notes: z.string().max(4000).nullable().optional(),
        add_to_calendar: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "reminders").findOne({ _id: data.id });
    if (!existing) throw new Error("Reminder not found");
    await assertCanAccessContact(db, context, String(existing.contact_id));
    if (!context.isAdmin && existing.assigned_to !== context.userId && existing.created_by !== context.userId) {
      throw new Error("Forbidden");
    }
    const patch: Record<string, unknown> = { updated_at: new Date() };
    if (data.type !== undefined) patch.type = data.type;
    if (data.title !== undefined) patch.title = data.title.trim() || TYPE_LABELS[data.type ?? (existing.type as ReminderType)];
    if (data.contact_id !== undefined) {
      await assertCanAccessContact(db, context, data.contact_id);
      patch.contact_id = data.contact_id;
    }
    if (data.project_id !== undefined) patch.project_id = data.project_id;
    if (data.assigned_to !== undefined) patch.assigned_to = data.assigned_to;
    if (data.due_at !== undefined) {
      patch.due_at = new Date(data.due_at);
      patch.notification_sent_at = null;
    }
    if (data.notes !== undefined) patch.notes = data.notes;
    await col(db, "reminders").updateOne({ _id: data.id }, { $set: patch });
    let next = (await col(db, "reminders").findOne({ _id: data.id })) as Record<string, unknown>;
    next = await maybeSyncCalendar(
      "update",
      String(next.assigned_to ?? context.userId),
      next,
      data.add_to_calendar,
    );
    const [out] = await enrich(db, [next]);
    return out;
  });

export const completeReminder = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "reminders").findOne({ _id: data.id });
    if (!existing) throw new Error("Reminder not found");
    await assertCanAccessContact(db, context, String(existing.contact_id));
    const now = new Date();
    await col(db, "reminders").updateOne(
      { _id: data.id },
      { $set: { status: "completed", completed_at: now, updated_at: now } },
    );
    // Complete does NOT delete Google Calendar event (meeting history).
    const next = await col(db, "reminders").findOne({ _id: data.id });
    const [out] = await enrich(db, [next as Record<string, unknown>]);
    return out;
  });

export const cancelReminder = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "reminders").findOne({ _id: data.id });
    if (!existing) throw new Error("Reminder not found");
    await assertCanAccessContact(db, context, String(existing.contact_id));
    const now = new Date();
    await col(db, "reminders").updateOne(
      { _id: data.id },
      { $set: { status: "cancelled", cancelled_at: now, updated_at: now } },
    );
    const next = await col(db, "reminders").findOne({ _id: data.id });
    await maybeSyncCalendar("cancel", String(existing.assigned_to), next as Record<string, unknown>);
    const [out] = await enrich(db, [next as Record<string, unknown>]);
    return out;
  });

export const deleteReminder = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "reminders").findOne({ _id: data.id });
    if (!existing) throw new Error("Reminder not found");
    await assertCanAccessContact(db, context, String(existing.contact_id));
    await maybeSyncCalendar("delete", String(existing.assigned_to), existing as Record<string, unknown>);
    await col(db, "reminders").deleteOne({ _id: data.id });
    return { ok: true };
  });
