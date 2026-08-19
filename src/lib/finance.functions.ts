import { createServerFn } from "@tanstack/react-start";
import {
  addDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isWithinInterval,
} from "date-fns";
import { z } from "zod";

import { requireAuth } from "@/integrations/mongo/auth-middleware";
import { toIso } from "@/integrations/mongo/client.server";
import type {
  ChartPoint,
  ContactFinanceSummary,
  Expense,
  ExpenseType,
  FinanceDashboard,
  FinanceMetrics,
  OutstandingRow,
  Payment,
  Project,
  ProjectProfitability,
  ProjectStatus,
  Transaction,
} from "@/lib/finance";
import { resolveDateRange, type DateRangePreset } from "@/lib/finance";
import { normalizePhone } from "@/lib/phone";

type Actor = { userId: string; isAdmin: boolean };

const dateRangeInput = z.object({
  preset: z.enum(["today", "last7", "last30", "thisMonth", "prevMonth", "custom"]),
  from: z.string().optional(),
  to: z.string().optional(),
});

function contactFilter(actor: Actor) {
  return actor.isAdmin ? {} : { assigned_to: actor.userId };
}

function asProject(doc: Record<string, unknown>): Project {
  return {
    id: String(doc._id ?? doc.id),
    contact_id: String(doc.contact_id),
    contact_phone: normalizePhone((doc.contact_phone as string | null) ?? null),
    name: String(doc.name),
    value: Number(doc.value ?? 0),
    start_date: doc.start_date ? toIso(doc.start_date) : null,
    completion_date: doc.completion_date ? toIso(doc.completion_date) : null,
    status: (doc.status as ProjectStatus) ?? "active",
    created_at: toIso(doc.created_at),
    updated_at: toIso(doc.updated_at),
  };
}

function asPayment(doc: Record<string, unknown>): Payment {
  return {
    id: String(doc._id ?? doc.id),
    contact_id: String(doc.contact_id),
    contact_phone: normalizePhone((doc.contact_phone as string | null) ?? null),
    project_id: (doc.project_id as string | null) ?? null,
    amount: Number(doc.amount ?? 0),
    date: toIso(doc.date),
    payment_method: String(doc.payment_method ?? "Other"),
    description: (doc.description as string | null) ?? null,
    created_at: toIso(doc.created_at),
  };
}

function asExpense(doc: Record<string, unknown>): Expense {
  return {
    id: String(doc._id ?? doc.id),
    date: toIso(doc.date),
    type: doc.type as ExpenseType,
    category: String(doc.category ?? "Other"),
    contact_id: (doc.contact_id as string | null) ?? null,
    project_id: (doc.project_id as string | null) ?? null,
    amount: Number(doc.amount ?? 0),
    description: (doc.description as string | null) ?? null,
    created_at: toIso(doc.created_at),
  };
}

async function getAccessibleContactIds(db: import("mongodb").Db, actor: Actor) {
  const { col } = await import("@/integrations/mongo/client.server");
  if (actor.isAdmin) return null;
  const rows = await col(db, "contacts").find(contactFilter(actor)).project({ _id: 1 }).toArray();
  return new Set(rows.map((r) => String(r._id)));
}

async function assertContactAccess(db: import("mongodb").Db, actor: Actor, contactId: string) {
  const { col } = await import("@/integrations/mongo/client.server");
  const contact = await col(db, "contacts").findOne({ _id: contactId });
  if (!contact) throw new Error("Contact not found");
  if (!actor.isAdmin && contact.assigned_to !== actor.userId) {
    throw new Error("Forbidden");
  }
  return contact;
}

function parseDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
  return d;
}

function sumAmounts(items: { amount: number }[]) {
  return items.reduce((s, i) => s + i.amount, 0);
}

function paymentsForProject(payments: Payment[], projectId: string) {
  return payments.filter((p) => p.project_id === projectId);
}

function expensesForProject(expenses: Expense[], projectId: string) {
  return expenses.filter((e) => e.type === "project" && e.project_id === projectId);
}

function buildChart(
  preset: DateRangePreset,
  from: Date,
  to: Date,
  payments: Payment[],
  businessExpenses: Expense[],
): ChartPoint[] {
  const useWeekly = preset === "last30" || preset === "thisMonth" || preset === "prevMonth";

  if (useWeekly) {
    const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const interval = { start: weekStart, end: weekEnd > to ? to : weekEnd };
      const revenue = sumAmounts(
        payments.filter((p) => isWithinInterval(new Date(p.date), interval)),
      );
      const expenses = sumAmounts(
        businessExpenses.filter((e) => isWithinInterval(new Date(e.date), interval)),
      );
      return {
        label: format(weekStart, "d MMM"),
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    });
  }

  const days = eachDayOfInterval({ start: from, end: to });
  return days.map((day) => {
    const interval = { start: day, end: addDays(day, 1) };
    const revenue = sumAmounts(
      payments.filter((p) => isWithinInterval(new Date(p.date), interval)),
    );
    const expenses = sumAmounts(
      businessExpenses.filter((e) => isWithinInterval(new Date(e.date), interval)),
    );
    return {
      label: format(day, "d MMM"),
      revenue,
      expenses,
      profit: revenue - expenses,
    };
  });
}

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const accessible = await getAccessibleContactIds(db, context);
    const filter = accessible ? { contact_id: { $in: [...accessible] } } : {};
    const rows = await col(db, "projects").find(filter).sort({ created_at: -1 }).toArray();
    return rows.map((r) => asProject(r as Record<string, unknown>));
  });

export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const accessible = await getAccessibleContactIds(db, context);
    const filter = accessible ? { contact_id: { $in: [...accessible] } } : {};
    const rows = await col(db, "payments").find(filter).sort({ date: -1 }).toArray();
    return rows.map((r) => asPayment(r as Record<string, unknown>));
  });

export const listExpenses = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const accessible = await getAccessibleContactIds(db, context);
    let filter: Record<string, unknown> = {};
    if (accessible) {
      filter = {
        $or: [{ type: "business" }, { type: "personal" }, { contact_id: { $in: [...accessible] } }],
      };
    }
    const rows = await col(db, "expenses").find(filter).sort({ date: -1 }).toArray();
    return rows.map((r) => asExpense(r as Record<string, unknown>));
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        contact_id: z.string().min(1),
        name: z.string().min(1).max(200),
        value: z.number().min(0),
        start_date: z.string().nullable().optional(),
        completion_date: z.string().nullable().optional(),
        status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const contact = await assertContactAccess(db, context, data.contact_id);
    const id = crypto.randomUUID();
    const now = new Date();
    const doc = {
      _id: id,
      id,
      contact_id: data.contact_id,
      contact_phone: normalizePhone((contact.phone as string | null) ?? null),
      name: data.name,
      value: data.value,
      start_date: data.start_date ? parseDate(data.start_date) : null,
      completion_date: data.completion_date ? parseDate(data.completion_date) : null,
      status: data.status ?? "active",
      created_by: context.userId,
      created_at: now,
      updated_at: now,
    };
    await col(db, "projects").insertOne(doc);
    return asProject(doc);
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        name: z.string().min(1).max(200).optional(),
        value: z.number().min(0).optional(),
        start_date: z.string().nullable().optional(),
        completion_date: z.string().nullable().optional(),
        status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "projects").findOne({ _id: data.id });
    if (!existing) throw new Error("Project not found");
    await assertContactAccess(db, context, String(existing.contact_id));
    const patch: Record<string, unknown> = { updated_at: new Date() };
    if (data.name !== undefined) patch.name = data.name;
    if (data.value !== undefined) patch.value = data.value;
    if (data.status !== undefined) patch.status = data.status;
    if (data.start_date !== undefined) {
      patch.start_date = data.start_date ? parseDate(data.start_date) : null;
    }
    if (data.completion_date !== undefined) {
      patch.completion_date = data.completion_date ? parseDate(data.completion_date) : null;
    }
    await col(db, "projects").updateOne({ _id: data.id }, { $set: patch });
    const next = await col(db, "projects").findOne({ _id: data.id });
    return asProject(next as Record<string, unknown>);
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "projects").findOne({ _id: data.id });
    if (!existing) throw new Error("Project not found");
    await assertContactAccess(db, context, String(existing.contact_id));
    await col(db, "projects").deleteOne({ _id: data.id });
    return { ok: true };
  });

export const createPayment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        contact_id: z.string().min(1),
        project_id: z.string().nullable().optional(),
        amount: z.number().positive(),
        date: z.string().min(1),
        payment_method: z.string().min(1),
        description: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const contact = await assertContactAccess(db, context, data.contact_id);
    if (data.project_id) {
      const project = await col(db, "projects").findOne({ _id: data.project_id });
      if (!project || String(project.contact_id) !== data.contact_id) {
        throw new Error("Project not found for this customer");
      }
    }
    const id = crypto.randomUUID();
    const now = new Date();
    const doc = {
      _id: id,
      id,
      contact_id: data.contact_id,
      contact_phone: normalizePhone((contact.phone as string | null) ?? null),
      project_id: data.project_id ?? null,
      amount: data.amount,
      date: parseDate(data.date),
      payment_method: data.payment_method,
      description: data.description ?? null,
      created_by: context.userId,
      created_at: now,
    };
    await col(db, "payments").insertOne(doc);
    return asPayment(doc);
  });

export const updatePayment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        project_id: z.string().nullable().optional(),
        amount: z.number().positive().optional(),
        date: z.string().min(1).optional(),
        payment_method: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "payments").findOne({ _id: data.id });
    if (!existing) throw new Error("Payment not found");
    await assertContactAccess(db, context, String(existing.contact_id));
    const patch: Record<string, unknown> = {};
    if (data.amount !== undefined) patch.amount = data.amount;
    if (data.date !== undefined) patch.date = parseDate(data.date);
    if (data.payment_method !== undefined) patch.payment_method = data.payment_method;
    if (data.description !== undefined) patch.description = data.description;
    if (data.project_id !== undefined) patch.project_id = data.project_id;
    await col(db, "payments").updateOne({ _id: data.id }, { $set: patch });
    const next = await col(db, "payments").findOne({ _id: data.id });
    return asPayment(next as Record<string, unknown>);
  });

export const deletePayment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "payments").findOne({ _id: data.id });
    if (!existing) throw new Error("Payment not found");
    await assertContactAccess(db, context, String(existing.contact_id));
    await col(db, "payments").deleteOne({ _id: data.id });
    return { ok: true };
  });

export const createExpense = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        date: z.string().min(1),
        type: z.enum(["business", "project", "personal"]),
        category: z.string().min(1),
        contact_id: z.string().nullable().optional(),
        project_id: z.string().nullable().optional(),
        amount: z.number().positive(),
        description: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    if (data.type === "project") {
      if (!data.contact_id || !data.project_id) {
        throw new Error("Project expenses require a customer and project");
      }
      await assertContactAccess(db, context, data.contact_id);
    }
    const id = crypto.randomUUID();
    const now = new Date();
    const doc = {
      _id: id,
      id,
      date: parseDate(data.date),
      type: data.type,
      category: data.category,
      contact_id: data.contact_id ?? null,
      project_id: data.project_id ?? null,
      amount: data.amount,
      description: data.description ?? null,
      created_by: context.userId,
      created_at: now,
    };
    await col(db, "expenses").insertOne(doc);
    return asExpense(doc);
  });

export const updateExpense = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        date: z.string().min(1).optional(),
        type: z.enum(["business", "project", "personal"]).optional(),
        category: z.string().min(1).optional(),
        contact_id: z.string().nullable().optional(),
        project_id: z.string().nullable().optional(),
        amount: z.number().positive().optional(),
        description: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "expenses").findOne({ _id: data.id });
    if (!existing) throw new Error("Expense not found");
    if (existing.type === "project" && existing.contact_id) {
      await assertContactAccess(db, context, String(existing.contact_id));
    }
    const patch: Record<string, unknown> = {};
    if (data.date !== undefined) patch.date = parseDate(data.date);
    if (data.type !== undefined) patch.type = data.type;
    if (data.category !== undefined) patch.category = data.category;
    if (data.contact_id !== undefined) patch.contact_id = data.contact_id;
    if (data.project_id !== undefined) patch.project_id = data.project_id;
    if (data.amount !== undefined) patch.amount = data.amount;
    if (data.description !== undefined) patch.description = data.description;
    await col(db, "expenses").updateOne({ _id: data.id }, { $set: patch });
    const next = await col(db, "expenses").findOne({ _id: data.id });
    return asExpense(next as Record<string, unknown>);
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const existing = await col(db, "expenses").findOne({ _id: data.id });
    if (!existing) throw new Error("Expense not found");
    if (existing.type === "project" && existing.contact_id) {
      await assertContactAccess(db, context, String(existing.contact_id));
    }
    await col(db, "expenses").deleteOne({ _id: data.id });
    return { ok: true };
  });

export const markContactConverted = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ contactId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    await assertContactAccess(db, context, data.contactId);
    const now = new Date();
    await col(db, "contacts").updateOne(
      { _id: data.contactId, converted_at: { $exists: false } },
      { $set: { converted_at: now, updated_at: now } },
    );
    await col(db, "contacts").updateOne(
      { _id: data.contactId, converted_at: null },
      { $set: { converted_at: now, updated_at: now } },
    );
    return { ok: true };
  });

export const getFinanceDashboard = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => dateRangeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const { from, to } = resolveDateRange(data.preset, data.from, data.to);

    const accessible = await getAccessibleContactIds(db, context);
    const contactFilterQuery = accessible ? { _id: { $in: [...accessible] } } : {};
    const paymentFilter = accessible ? { contact_id: { $in: [...accessible] } } : {};
    const projectFilter = accessible ? { contact_id: { $in: [...accessible] } } : {};

    const [contacts, payments, expenses, projects] = await Promise.all([
      col(db, "contacts").find(contactFilterQuery).toArray(),
      col(db, "payments").find(paymentFilter).toArray(),
      col(db, "expenses").find({}).toArray(),
      col(db, "projects").find(projectFilter).toArray(),
    ]);

    const paymentRows = payments.map((p) => asPayment(p as Record<string, unknown>));
    const expenseRows = expenses.map((e) => asExpense(e as Record<string, unknown>));
    const projectRows = projects.map((p) => asProject(p as Record<string, unknown>));

    const rangePayments = paymentRows.filter((p) => {
      const d = new Date(p.date);
      return d >= from && d <= to;
    });
    const rangeBusinessExpenses = expenseRows.filter((e) => {
      const d = new Date(e.date);
      return e.type === "business" && d >= from && d <= to;
    });
    const rangePersonalExpenses = expenseRows.filter((e) => {
      const d = new Date(e.date);
      return e.type === "personal" && d >= from && d <= to;
    });

    const revenue = sumAmounts(rangePayments);
    const businessExpenses = sumAmounts(rangeBusinessExpenses);

    const newLeads = contacts.filter((c) => {
      const created = new Date(toIso(c.created_at));
      return created >= from && created <= to;
    }).length;

    const convertedLeads = contacts.filter((c) => {
      if (!c.converted_at) return false;
      const converted = new Date(toIso(c.converted_at));
      return converted >= from && converted <= to;
    }).length;

    const conversionRate = newLeads > 0 ? Math.round((convertedLeads / newLeads) * 100) : 0;

    const contactMap = Object.fromEntries(
      contacts.map((c) => [String(c._id), { name: String(c.name), phone: c.phone }]),
    );

    const outstanding: OutstandingRow[] = [];
    for (const project of projectRows) {
      const received = sumAmounts(paymentsForProject(paymentRows, project.id));
      const remaining = Math.max(0, project.value - received);
      if (remaining <= 0) continue;
      const contact = contactMap[project.contact_id];
      outstanding.push({
        contact_id: project.contact_id,
        contact_name: contact?.name ?? "Unknown",
        contact_phone: normalizePhone((contact?.phone as string | null) ?? null),
        project_id: project.id,
        project_name: project.name,
        project_value: project.value,
        amount_received: received,
        amount_remaining: remaining,
      });
    }
    outstanding.sort((a, b) => b.amount_remaining - a.amount_remaining);

    const metrics: FinanceMetrics = {
      revenue,
      businessExpenses,
      netProfit: revenue - businessExpenses,
      outstanding: outstanding.reduce((s, r) => s + r.amount_remaining, 0),
      newLeads,
      convertedLeads,
      conversionRate,
      personalExpenses: sumAmounts(rangePersonalExpenses),
    };

    const chart = buildChart(data.preset, from, to, rangePayments, rangeBusinessExpenses);

    return { metrics, chart, outstanding } satisfies FinanceDashboard;
  });

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => dateRangeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const { from, to } = resolveDateRange(data.preset, data.from, data.to);

    const accessible = await getAccessibleContactIds(db, context);
    const paymentFilter = accessible ? { contact_id: { $in: [...accessible] } } : {};

    const [payments, expenses, contacts, projects] = await Promise.all([
      col(db, "payments").find(paymentFilter).toArray(),
      col(db, "expenses").find({}).toArray(),
      col(db, "contacts").find({}).toArray(),
      col(db, "projects").find({}).toArray(),
    ]);

    const contactMap = Object.fromEntries(contacts.map((c) => [String(c._id), String(c.name)]));
    const projectMap = Object.fromEntries(projects.map((p) => [String(p._id), String(p.name)]));

    const txs: Transaction[] = [];

    for (const raw of payments) {
      const p = asPayment(raw as Record<string, unknown>);
      const d = new Date(p.date);
      if (d < from || d > to) continue;
      if (accessible && !accessible.has(p.contact_id)) continue;
      txs.push({
        id: p.id,
        date: p.date,
        type: "income",
        contact_id: p.contact_id,
        contact_name: contactMap[p.contact_id] ?? null,
        project_id: p.project_id,
        project_name: p.project_id ? (projectMap[p.project_id] ?? null) : null,
        category: null,
        expense_type: null,
        amount: p.amount,
        description: p.description,
        payment_method: p.payment_method,
      });
    }

    for (const raw of expenses) {
      const e = asExpense(raw as Record<string, unknown>);
      const d = new Date(e.date);
      if (d < from || d > to) continue;
      if (accessible && e.type === "project" && e.contact_id && !accessible.has(e.contact_id)) {
        continue;
      }
      txs.push({
        id: e.id,
        date: e.date,
        type: "expense",
        contact_id: e.contact_id,
        contact_name: e.contact_id ? (contactMap[e.contact_id] ?? null) : null,
        project_id: e.project_id,
        project_name: e.project_id ? (projectMap[e.project_id] ?? null) : null,
        category: e.category,
        expense_type: e.type,
        amount: e.amount,
        description: e.description,
        payment_method: null,
      });
    }

    txs.sort((a, b) => b.date.localeCompare(a.date));
    return txs;
  });

export const getContactFinanceSummary = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ contactId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    await assertContactAccess(db, context, data.contactId);

    const [projects, payments, expenses] = await Promise.all([
      col(db, "projects").find({ contact_id: data.contactId }).toArray(),
      col(db, "payments").find({ contact_id: data.contactId }).toArray(),
      col(db, "expenses").find({ contact_id: data.contactId, type: "project" }).toArray(),
    ]);

    const projectRows = projects.map((p) => asProject(p as Record<string, unknown>));
    const paymentRows = payments.map((p) => asPayment(p as Record<string, unknown>));
    const expenseRows = expenses.map((e) => asExpense(e as Record<string, unknown>));

    const profitability: ProjectProfitability[] = projectRows.map((project) => {
      const received = sumAmounts(paymentsForProject(paymentRows, project.id));
      const projExpenses = sumAmounts(expensesForProject(expenseRows, project.id));
      return {
        project,
        amount_received: received,
        outstanding: Math.max(0, project.value - received),
        project_expenses: projExpenses,
        estimated_profit: received - projExpenses,
      };
    });

    const totalProjectValue = sumAmounts(projectRows.map((p) => ({ amount: p.value })));
    const totalReceived = sumAmounts(paymentRows);
    const projectExpenses = sumAmounts(expenseRows);

    return {
      total_projects: projectRows.length,
      total_project_value: totalProjectValue,
      total_received: totalReceived,
      outstanding: Math.max(0, totalProjectValue - totalReceived),
      project_expenses: projectExpenses,
      net_profit: totalReceived - projectExpenses,
      projects: profitability,
    } satisfies ContactFinanceSummary;
  });

export const getProjectProfitability = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const projectDoc = await col(db, "projects").findOne({ _id: data.projectId });
    if (!projectDoc) throw new Error("Project not found");
    await assertContactAccess(db, context, String(projectDoc.contact_id));

    const project = asProject(projectDoc as Record<string, unknown>);
    const [payments, expenses] = await Promise.all([
      col(db, "payments").find({ project_id: data.projectId }).toArray(),
      col(db, "expenses").find({ project_id: data.projectId, type: "project" }).toArray(),
    ]);

    const paymentRows = payments.map((p) => asPayment(p as Record<string, unknown>));
    const expenseRows = expenses.map((e) => asExpense(e as Record<string, unknown>));
    const received = sumAmounts(paymentRows);

    return {
      project,
      amount_received: received,
      outstanding: Math.max(0, project.value - received),
      project_expenses: sumAmounts(expenseRows),
      estimated_profit: received - sumAmounts(expenseRows),
    } satisfies ProjectProfitability;
  });
