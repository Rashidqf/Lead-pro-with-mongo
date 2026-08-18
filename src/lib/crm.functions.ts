import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAuth } from "@/integrations/mongo/auth-middleware";
import type { Activity, BoardColumn, Contact, Profile } from "@/lib/crm";

type Actor = { userId: string; isAdmin: boolean };

function asProfile(doc: Record<string, unknown>): Profile {
  const { toIso } = requireIso();
  return {
    id: String(doc._id ?? doc.id),
    email: (doc.email as string | null) ?? null,
    full_name: (doc.full_name as string | null) ?? null,
    is_active: doc.is_active !== false,
    created_at: toIso(doc.created_at),
  };
}

function requireIso() {
  return {
    toIso(value: unknown) {
      if (value instanceof Date) return value.toISOString();
      if (value && typeof value === "object" && "$date" in value) {
        return new Date(String((value as { $date: string }).$date)).toISOString();
      }
      if (typeof value === "string") return new Date(value).toISOString();
      return new Date().toISOString();
    },
  };
}

function asColumn(doc: Record<string, unknown>): BoardColumn {
  return {
    id: String(doc._id ?? doc.id),
    name: String(doc.name),
    position: Number(doc.position ?? 0),
    color: String(doc.color ?? "slate"),
  };
}

function asContact(doc: Record<string, unknown>): Contact {
  const { toIso } = requireIso();
  return {
    id: String(doc._id ?? doc.id),
    name: String(doc.name),
    company: (doc.company as string | null) ?? null,
    phone: (doc.phone as string | null) ?? null,
    email: (doc.email as string | null) ?? null,
    address: (doc.address as string | null) ?? null,
    notes: (doc.notes as string | null) ?? null,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
    last_activity_date: (doc.last_activity_date as string | null) ?? null,
    last_message: (doc.last_message as string | null) ?? null,
    column_id: (doc.column_id as string | null) ?? null,
    assigned_to: (doc.assigned_to as string | null) ?? null,
    position: Number(doc.position ?? 0),
    created_at: toIso(doc.created_at),
    updated_at: toIso(doc.updated_at),
  };
}

function asActivity(doc: Record<string, unknown>): Activity {
  const { toIso } = requireIso();
  return {
    id: String(doc._id ?? doc.id),
    contact_id: (doc.contact_id as string | null) ?? null,
    user_id: (doc.user_id as string | null) ?? null,
    action: String(doc.action),
    detail: (doc.detail as string | null) ?? null,
    created_at: toIso(doc.created_at),
  };
}

function contactFilter(actor: Actor) {
  return actor.isAdmin ? {} : { assigned_to: actor.userId };
}

async function writeActivity(
  db: import("mongodb").Db,
  actor: Actor,
  contactId: string | null,
  action: string,
  detail?: string,
) {
  const { col } = await import("@/integrations/mongo/client.server");
  const id = crypto.randomUUID();
  await col(db, "activities").insertOne({
    _id: id,
    id,
    user_id: actor.userId,
    contact_id: contactId,
    action,
    detail: detail ?? null,
    created_at: new Date(),
  });
}

export const listColumns = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const rows = await col(db,"board_columns").find({}).sort({ position: 1 }).toArray();
    return rows.map((row) => asColumn(row as Record<string, unknown>));
  });

export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const rows = await col(db, "contacts")
      .find(contactFilter(context))
      .sort({ created_at: -1 })
      .limit(5000)
      .toArray();
    return rows.map((row) => asContact(row as Record<string, unknown>));
  });

export const listProfiles = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const rows = await col(db,"profiles").find({}).sort({ created_at: 1 }).toArray();
    return rows.map((row) => asProfile(row as Record<string, unknown>));
  });

export const listRoles = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const rows = await col(db,"user_roles").find({}).toArray();
    return rows.map((row) => ({
      user_id: String(row.user_id),
      role: row.role as "admin" | "user",
    }));
  });

export const listActivities = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const filter = context.isAdmin ? {} : { user_id: context.userId };
    const rows = await col(db, "activities")
      .find(filter)
      .sort({ created_at: -1 })
      .limit(25)
      .toArray();
    return rows.map((row) => asActivity(row as Record<string, unknown>));
  });

export const createContact = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1).max(200),
        column_id: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!context.isAdmin) throw new Error("Forbidden: admin access required");
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const id = crypto.randomUUID();
    const now = new Date();
    const doc = {
      _id: id,
      id,
      name: data.name,
      company: null,
      phone: null,
      email: null,
      address: null,
      notes: null,
      tags: [] as string[],
      last_activity_date: null,
      last_message: null,
      column_id: data.column_id ?? null,
      assigned_to: null,
      created_by: context.userId,
      position: 0,
      created_at: now,
      updated_at: now,
    };
    await col(db,"contacts").insertOne(doc);
    return asContact(doc);
  });

export const updateContact = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        name: z.string().min(1).max(200).optional(),
        company: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        column_id: z.string().nullable().optional(),
        assigned_to: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db,"contacts").findOne({ _id: data.id });
    if (!existing) throw new Error("Contact not found");
    if (!context.isAdmin && existing.assigned_to !== context.userId) {
      throw new Error("Forbidden");
    }
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = { updated_at: new Date() };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    if (!context.isAdmin) delete patch.assigned_to;
    let action = "updated";
    if (patch.column_id !== undefined && patch.column_id !== existing.column_id) action = "moved";
    else if (patch.assigned_to !== undefined && patch.assigned_to !== existing.assigned_to) action = "assigned";
    let detail = (patch.name as string | undefined) ?? String(existing.name);
    if (action === "assigned") {
      const assigneeId = patch.assigned_to as string | null;
      if (!assigneeId) detail = "Unassigned";
      else {
        const profile = await col(db,"profiles").findOne({ _id: assigneeId });
        detail = String(profile?.full_name || profile?.email || "Unknown user");
      }
    }
    await writeActivity(db, context, id, action, detail);
    const next = await col(db,"contacts").findOne({ _id: id });
    return asContact(next as Record<string, unknown>);
  });

export const deleteContact = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1), name: z.string().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!context.isAdmin) throw new Error("Forbidden: admin access required");
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db,"contacts").findOne({ _id: data.id });
    if (!existing) throw new Error("Contact not found");
    await col(db,"contacts").deleteOne({ _id: data.id });
    await writeActivity(db, context, null, "deleted", data.name ?? String(existing.name));
    return { ok: true };
  });

export const importContacts = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        column_id: z.string().nullable().optional(),
        rows: z.array(
          z.object({
            name: z.string().min(1).max(200),
            phone: z.string().nullable().optional(),
            email: z.string().nullable().optional(),
            company: z.string().nullable().optional(),
            address: z.string().nullable().optional(),
            notes: z.string().nullable().optional(),
            last_activity_date: z.string().nullable().optional(),
            last_message: z.string().nullable().optional(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!context.isAdmin) throw new Error("Forbidden: admin access required");
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const now = new Date();
    const docs = data.rows.map((row) => {
      const id = crypto.randomUUID();
      return {
        _id: id,
        id,
        name: row.name,
        phone: row.phone ?? null,
        email: row.email ?? null,
        company: row.company ?? null,
        address: row.address ?? null,
        notes: row.notes ?? null,
        tags: [] as string[],
        last_activity_date: row.last_activity_date ?? null,
        last_message: row.last_message ?? null,
        column_id: data.column_id ?? null,
        assigned_to: null,
        created_by: context.userId,
        position: 0,
        created_at: now,
        updated_at: now,
      };
    });
    if (docs.length) await col(db,"contacts").insertMany(docs);
    await writeActivity(db, context, null, "imported", `${docs.length} contacts`);
    return { count: docs.length };
  });

export const logContactActivity = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        contactId: z.string().nullable(),
        action: z.string().min(1).max(80),
        detail: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    await writeActivity(db, context, data.contactId, data.action, data.detail);
    return { ok: true };
  });
