import { i as createServerFn } from "./server-Yvyy7qRX.mjs";
import { t as createServerRpc } from "./createServerRpc-ChGssE9S.mjs";
import { t as requireAuth } from "./auth-middleware-a5hCx0S0.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { r as normalizePhone } from "./phone-C1ClWIw4.mjs";
import { i as toIso } from "./client.server-COnOrad6.mjs";
import { a as endOfWeek, c as eachDayOfInterval, f as addDays, i as format, r as isWithinInterval, s as eachWeekOfInterval } from "../_libs/date-fns.mjs";
import { v as resolveDateRange } from "./finance-DpBCcV6C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance.functions-BAKnz9Xw.js
var dateRangeInput = objectType({
	preset: enumType([
		"today",
		"last7",
		"last30",
		"thisMonth",
		"prevMonth",
		"custom"
	]),
	from: stringType().optional(),
	to: stringType().optional()
});
function contactFilter(actor) {
	return actor.isAdmin ? {} : { assigned_to: actor.userId };
}
function asProject(doc) {
	return {
		id: String(doc._id ?? doc.id),
		contact_id: String(doc.contact_id),
		contact_phone: normalizePhone(doc.contact_phone ?? null),
		name: String(doc.name),
		value: Number(doc.value ?? 0),
		start_date: doc.start_date ? toIso(doc.start_date) : null,
		completion_date: doc.completion_date ? toIso(doc.completion_date) : null,
		status: doc.status ?? "active",
		created_at: toIso(doc.created_at),
		updated_at: toIso(doc.updated_at)
	};
}
function asPayment(doc) {
	return {
		id: String(doc._id ?? doc.id),
		contact_id: String(doc.contact_id),
		contact_phone: normalizePhone(doc.contact_phone ?? null),
		project_id: doc.project_id ?? null,
		amount: Number(doc.amount ?? 0),
		date: toIso(doc.date),
		payment_method: String(doc.payment_method ?? "Other"),
		description: doc.description ?? null,
		created_at: toIso(doc.created_at)
	};
}
function asExpense(doc) {
	return {
		id: String(doc._id ?? doc.id),
		date: toIso(doc.date),
		type: doc.type,
		category: String(doc.category ?? "Other"),
		contact_id: doc.contact_id ?? null,
		project_id: doc.project_id ?? null,
		amount: Number(doc.amount ?? 0),
		description: doc.description ?? null,
		created_at: toIso(doc.created_at)
	};
}
async function getAccessibleContactIds(db, actor) {
	const { col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	if (actor.isAdmin) return null;
	const rows = await col(db, "contacts").find(contactFilter(actor)).project({ _id: 1 }).toArray();
	return new Set(rows.map((r) => String(r._id)));
}
async function assertContactAccess(db, actor, contactId) {
	const { col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const contact = await col(db, "contacts").findOne({ _id: contactId });
	if (!contact) throw new Error("Contact not found");
	if (!actor.isAdmin && contact.assigned_to !== actor.userId) throw new Error("Forbidden");
	return contact;
}
function parseDate(value) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
	return d;
}
function sumAmounts(items) {
	return items.reduce((s, i) => s + i.amount, 0);
}
function paymentsForProject(payments, projectId) {
	return payments.filter((p) => p.project_id === projectId);
}
function expensesForProject(expenses, projectId) {
	return expenses.filter((e) => e.type === "project" && e.project_id === projectId);
}
function buildChart(preset, from, to, payments, businessExpenses) {
	if (preset === "last30" || preset === "thisMonth" || preset === "prevMonth") return eachWeekOfInterval({
		start: from,
		end: to
	}, { weekStartsOn: 1 }).map((weekStart) => {
		const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
		const interval = {
			start: weekStart,
			end: weekEnd > to ? to : weekEnd
		};
		const revenue = sumAmounts(payments.filter((p) => isWithinInterval(new Date(p.date), interval)));
		const expenses = sumAmounts(businessExpenses.filter((e) => isWithinInterval(new Date(e.date), interval)));
		return {
			label: format(weekStart, "d MMM"),
			revenue,
			expenses,
			profit: revenue - expenses
		};
	});
	return eachDayOfInterval({
		start: from,
		end: to
	}).map((day) => {
		const interval = {
			start: day,
			end: addDays(day, 1)
		};
		const revenue = sumAmounts(payments.filter((p) => isWithinInterval(new Date(p.date), interval)));
		const expenses = sumAmounts(businessExpenses.filter((e) => isWithinInterval(new Date(e.date), interval)));
		return {
			label: format(day, "d MMM"),
			revenue,
			expenses,
			profit: revenue - expenses
		};
	});
}
var listProjects_createServerFn_handler = createServerRpc({
	id: "4bb0304f41c8281e81277b38b1078b8615220a8fa97f1777cea1f8283198245d",
	name: "listProjects",
	filename: "src/lib/finance.functions.ts"
}, (opts) => listProjects.__executeServer(opts));
var listProjects = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listProjects_createServerFn_handler, async ({ context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const accessible = await getAccessibleContactIds(db, context);
	const filter = accessible ? { contact_id: { $in: [...accessible] } } : {};
	return (await col(db, "projects").find(filter).sort({ created_at: -1 }).toArray()).map((r) => asProject(r));
});
var listPayments_createServerFn_handler = createServerRpc({
	id: "28290d0858e4134f3df52fe73369b09e414f0d63359b672cbef239b18ce50700",
	name: "listPayments",
	filename: "src/lib/finance.functions.ts"
}, (opts) => listPayments.__executeServer(opts));
var listPayments = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listPayments_createServerFn_handler, async ({ context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const accessible = await getAccessibleContactIds(db, context);
	const filter = accessible ? { contact_id: { $in: [...accessible] } } : {};
	return (await col(db, "payments").find(filter).sort({ date: -1 }).toArray()).map((r) => asPayment(r));
});
var listExpenses_createServerFn_handler = createServerRpc({
	id: "26405da00d71dd486a845e6d1027a315631f0f02abd0c40c7fbc07db000c9ea1",
	name: "listExpenses",
	filename: "src/lib/finance.functions.ts"
}, (opts) => listExpenses.__executeServer(opts));
var listExpenses = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listExpenses_createServerFn_handler, async ({ context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const accessible = await getAccessibleContactIds(db, context);
	let filter = {};
	if (accessible) filter = { $or: [
		{ type: "business" },
		{ type: "personal" },
		{ contact_id: { $in: [...accessible] } }
	] };
	return (await col(db, "expenses").find(filter).sort({ date: -1 }).toArray()).map((r) => asExpense(r));
});
var createProject_createServerFn_handler = createServerRpc({
	id: "2a58f8c6733921043891a8402423833a9cae7092983cc6ded8811c918cb3f844",
	name: "createProject",
	filename: "src/lib/finance.functions.ts"
}, (opts) => createProject.__executeServer(opts));
var createProject = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	contact_id: stringType().min(1),
	name: stringType().min(1).max(200),
	value: numberType().min(0),
	start_date: stringType().nullable().optional(),
	completion_date: stringType().nullable().optional(),
	status: enumType([
		"active",
		"completed",
		"on_hold",
		"cancelled"
	]).optional()
}).parse(input)).handler(createProject_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const contact = await assertContactAccess(db, context, data.contact_id);
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	const doc = {
		_id: id,
		id,
		contact_id: data.contact_id,
		contact_phone: normalizePhone(contact.phone ?? null),
		name: data.name,
		value: data.value,
		start_date: data.start_date ? parseDate(data.start_date) : null,
		completion_date: data.completion_date ? parseDate(data.completion_date) : null,
		status: data.status ?? "active",
		created_by: context.userId,
		created_at: now,
		updated_at: now
	};
	await col(db, "projects").insertOne(doc);
	return asProject(doc);
});
var updateProject_createServerFn_handler = createServerRpc({
	id: "df416e66d4c3b71a18fb35266d04d2ed5a850a9a4ff3710ba840b95c6913a294",
	name: "updateProject",
	filename: "src/lib/finance.functions.ts"
}, (opts) => updateProject.__executeServer(opts));
var updateProject = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().min(1).max(200).optional(),
	value: numberType().min(0).optional(),
	start_date: stringType().nullable().optional(),
	completion_date: stringType().nullable().optional(),
	status: enumType([
		"active",
		"completed",
		"on_hold",
		"cancelled"
	]).optional()
}).parse(input)).handler(updateProject_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "projects").findOne({ _id: data.id });
	if (!existing) throw new Error("Project not found");
	await assertContactAccess(db, context, String(existing.contact_id));
	const patch = { updated_at: /* @__PURE__ */ new Date() };
	if (data.name !== void 0) patch.name = data.name;
	if (data.value !== void 0) patch.value = data.value;
	if (data.status !== void 0) patch.status = data.status;
	if (data.start_date !== void 0) patch.start_date = data.start_date ? parseDate(data.start_date) : null;
	if (data.completion_date !== void 0) patch.completion_date = data.completion_date ? parseDate(data.completion_date) : null;
	await col(db, "projects").updateOne({ _id: data.id }, { $set: patch });
	return asProject(await col(db, "projects").findOne({ _id: data.id }));
});
var deleteProject_createServerFn_handler = createServerRpc({
	id: "0dc9f18acecc32c439cbeeee80cb1a6d3ef032989c4cad696c98c40ea1602032",
	name: "deleteProject",
	filename: "src/lib/finance.functions.ts"
}, (opts) => deleteProject.__executeServer(opts));
var deleteProject = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(deleteProject_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "projects").findOne({ _id: data.id });
	if (!existing) throw new Error("Project not found");
	await assertContactAccess(db, context, String(existing.contact_id));
	await col(db, "projects").deleteOne({ _id: data.id });
	return { ok: true };
});
var createPayment_createServerFn_handler = createServerRpc({
	id: "fb1fef4ca76329789988f717fef92168676b43124c795e47eaa660df944a64a6",
	name: "createPayment",
	filename: "src/lib/finance.functions.ts"
}, (opts) => createPayment.__executeServer(opts));
var createPayment = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	contact_id: stringType().min(1),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive(),
	date: stringType().min(1),
	payment_method: stringType().min(1),
	description: stringType().nullable().optional()
}).parse(input)).handler(createPayment_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const contact = await assertContactAccess(db, context, data.contact_id);
	if (data.project_id) {
		const project = await col(db, "projects").findOne({ _id: data.project_id });
		if (!project || String(project.contact_id) !== data.contact_id) throw new Error("Project not found for this customer");
	}
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	const doc = {
		_id: id,
		id,
		contact_id: data.contact_id,
		contact_phone: normalizePhone(contact.phone ?? null),
		project_id: data.project_id ?? null,
		amount: data.amount,
		date: parseDate(data.date),
		payment_method: data.payment_method,
		description: data.description ?? null,
		created_by: context.userId,
		created_at: now
	};
	await col(db, "payments").insertOne(doc);
	return asPayment(doc);
});
var updatePayment_createServerFn_handler = createServerRpc({
	id: "726ab7d0783e239089ea6d13b0c5f316218f508fb09f1ebfb339b501b149de25",
	name: "updatePayment",
	filename: "src/lib/finance.functions.ts"
}, (opts) => updatePayment.__executeServer(opts));
var updatePayment = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive().optional(),
	date: stringType().min(1).optional(),
	payment_method: stringType().min(1).optional(),
	description: stringType().nullable().optional()
}).parse(input)).handler(updatePayment_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "payments").findOne({ _id: data.id });
	if (!existing) throw new Error("Payment not found");
	await assertContactAccess(db, context, String(existing.contact_id));
	const patch = {};
	if (data.amount !== void 0) patch.amount = data.amount;
	if (data.date !== void 0) patch.date = parseDate(data.date);
	if (data.payment_method !== void 0) patch.payment_method = data.payment_method;
	if (data.description !== void 0) patch.description = data.description;
	if (data.project_id !== void 0) patch.project_id = data.project_id;
	await col(db, "payments").updateOne({ _id: data.id }, { $set: patch });
	return asPayment(await col(db, "payments").findOne({ _id: data.id }));
});
var deletePayment_createServerFn_handler = createServerRpc({
	id: "92ced228b5b714d503b9375cb435f21c8624a212dfd6571373adab4db637d28f",
	name: "deletePayment",
	filename: "src/lib/finance.functions.ts"
}, (opts) => deletePayment.__executeServer(opts));
var deletePayment = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(deletePayment_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "payments").findOne({ _id: data.id });
	if (!existing) throw new Error("Payment not found");
	await assertContactAccess(db, context, String(existing.contact_id));
	await col(db, "payments").deleteOne({ _id: data.id });
	return { ok: true };
});
var createExpense_createServerFn_handler = createServerRpc({
	id: "f320f928035e1a8a7eb22cfaf033a60706fbeca1bd34e48d3f9daaa73f4f4517",
	name: "createExpense",
	filename: "src/lib/finance.functions.ts"
}, (opts) => createExpense.__executeServer(opts));
var createExpense = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	date: stringType().min(1),
	type: enumType([
		"business",
		"project",
		"personal"
	]),
	category: stringType().min(1),
	contact_id: stringType().nullable().optional(),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive(),
	description: stringType().nullable().optional()
}).parse(input)).handler(createExpense_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	if (data.type === "project") {
		if (!data.contact_id || !data.project_id) throw new Error("Project expenses require a customer and project");
		await assertContactAccess(db, context, data.contact_id);
	}
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
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
		created_at: now
	};
	await col(db, "expenses").insertOne(doc);
	return asExpense(doc);
});
var updateExpense_createServerFn_handler = createServerRpc({
	id: "f5cfc69f9e2fc42a406a8938a31ceab405237f207b5380760e178464a5d5f68d",
	name: "updateExpense",
	filename: "src/lib/finance.functions.ts"
}, (opts) => updateExpense.__executeServer(opts));
var updateExpense = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	date: stringType().min(1).optional(),
	type: enumType([
		"business",
		"project",
		"personal"
	]).optional(),
	category: stringType().min(1).optional(),
	contact_id: stringType().nullable().optional(),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive().optional(),
	description: stringType().nullable().optional()
}).parse(input)).handler(updateExpense_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "expenses").findOne({ _id: data.id });
	if (!existing) throw new Error("Expense not found");
	if (existing.type === "project" && existing.contact_id) await assertContactAccess(db, context, String(existing.contact_id));
	const patch = {};
	if (data.date !== void 0) patch.date = parseDate(data.date);
	if (data.type !== void 0) patch.type = data.type;
	if (data.category !== void 0) patch.category = data.category;
	if (data.contact_id !== void 0) patch.contact_id = data.contact_id;
	if (data.project_id !== void 0) patch.project_id = data.project_id;
	if (data.amount !== void 0) patch.amount = data.amount;
	if (data.description !== void 0) patch.description = data.description;
	await col(db, "expenses").updateOne({ _id: data.id }, { $set: patch });
	return asExpense(await col(db, "expenses").findOne({ _id: data.id }));
});
var deleteExpense_createServerFn_handler = createServerRpc({
	id: "2ee550306b8d40331de7f9821e5403d52d2bfb492d498f72ad7bca730e4f2870",
	name: "deleteExpense",
	filename: "src/lib/finance.functions.ts"
}, (opts) => deleteExpense.__executeServer(opts));
var deleteExpense = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(deleteExpense_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "expenses").findOne({ _id: data.id });
	if (!existing) throw new Error("Expense not found");
	if (existing.type === "project" && existing.contact_id) await assertContactAccess(db, context, String(existing.contact_id));
	await col(db, "expenses").deleteOne({ _id: data.id });
	return { ok: true };
});
var markContactConverted_createServerFn_handler = createServerRpc({
	id: "e9b9c0690f011aa59d5b341d20aea449594f538369c5bb75efb35992908f1fe9",
	name: "markContactConverted",
	filename: "src/lib/finance.functions.ts"
}, (opts) => markContactConverted.__executeServer(opts));
var markContactConverted = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ contactId: stringType().min(1) }).parse(input)).handler(markContactConverted_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	await assertContactAccess(db, context, data.contactId);
	const now = /* @__PURE__ */ new Date();
	await col(db, "contacts").updateOne({
		_id: data.contactId,
		converted_at: { $exists: false }
	}, { $set: {
		converted_at: now,
		updated_at: now
	} });
	await col(db, "contacts").updateOne({
		_id: data.contactId,
		converted_at: null
	}, { $set: {
		converted_at: now,
		updated_at: now
	} });
	return { ok: true };
});
var getFinanceDashboard_createServerFn_handler = createServerRpc({
	id: "8a7f7bfa70079b98695220283f12f04aebc50e6607e2ae045f466d529ceda974",
	name: "getFinanceDashboard",
	filename: "src/lib/finance.functions.ts"
}, (opts) => getFinanceDashboard.__executeServer(opts));
var getFinanceDashboard = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => dateRangeInput.parse(input)).handler(getFinanceDashboard_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
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
		col(db, "projects").find(projectFilter).toArray()
	]);
	const paymentRows = payments.map((p) => asPayment(p));
	const expenseRows = expenses.map((e) => asExpense(e));
	const projectRows = projects.map((p) => asProject(p));
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
	const conversionRate = newLeads > 0 ? Math.round(convertedLeads / newLeads * 100) : 0;
	const contactMap = Object.fromEntries(contacts.map((c) => [String(c._id), {
		name: String(c.name),
		phone: c.phone
	}]));
	const outstanding = [];
	for (const project of projectRows) {
		const received = sumAmounts(paymentsForProject(paymentRows, project.id));
		const remaining = Math.max(0, project.value - received);
		if (remaining <= 0) continue;
		const contact = contactMap[project.contact_id];
		outstanding.push({
			contact_id: project.contact_id,
			contact_name: contact?.name ?? "Unknown",
			contact_phone: normalizePhone(contact?.phone ?? null),
			project_id: project.id,
			project_name: project.name,
			project_value: project.value,
			amount_received: received,
			amount_remaining: remaining
		});
	}
	outstanding.sort((a, b) => b.amount_remaining - a.amount_remaining);
	return {
		metrics: {
			revenue,
			businessExpenses,
			netProfit: revenue - businessExpenses,
			outstanding: outstanding.reduce((s, r) => s + r.amount_remaining, 0),
			newLeads,
			convertedLeads,
			conversionRate,
			personalExpenses: sumAmounts(rangePersonalExpenses)
		},
		chart: buildChart(data.preset, from, to, rangePayments, rangeBusinessExpenses),
		outstanding
	};
});
var listTransactions_createServerFn_handler = createServerRpc({
	id: "949c32252a4b5e67ed596eeca541fdf737e3f11f1bd672fd59b94e04314d5306",
	name: "listTransactions",
	filename: "src/lib/finance.functions.ts"
}, (opts) => listTransactions.__executeServer(opts));
var listTransactions = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => dateRangeInput.parse(input)).handler(listTransactions_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const { from, to } = resolveDateRange(data.preset, data.from, data.to);
	const accessible = await getAccessibleContactIds(db, context);
	const paymentFilter = accessible ? { contact_id: { $in: [...accessible] } } : {};
	const [payments, expenses, contacts, projects] = await Promise.all([
		col(db, "payments").find(paymentFilter).toArray(),
		col(db, "expenses").find({}).toArray(),
		col(db, "contacts").find({}).toArray(),
		col(db, "projects").find({}).toArray()
	]);
	const contactMap = Object.fromEntries(contacts.map((c) => [String(c._id), String(c.name)]));
	const projectMap = Object.fromEntries(projects.map((p) => [String(p._id), String(p.name)]));
	const txs = [];
	for (const raw of payments) {
		const p = asPayment(raw);
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
			project_name: p.project_id ? projectMap[p.project_id] ?? null : null,
			category: null,
			expense_type: null,
			amount: p.amount,
			description: p.description,
			payment_method: p.payment_method
		});
	}
	for (const raw of expenses) {
		const e = asExpense(raw);
		const d = new Date(e.date);
		if (d < from || d > to) continue;
		if (accessible && e.type === "project" && e.contact_id && !accessible.has(e.contact_id)) continue;
		txs.push({
			id: e.id,
			date: e.date,
			type: "expense",
			contact_id: e.contact_id,
			contact_name: e.contact_id ? contactMap[e.contact_id] ?? null : null,
			project_id: e.project_id,
			project_name: e.project_id ? projectMap[e.project_id] ?? null : null,
			category: e.category,
			expense_type: e.type,
			amount: e.amount,
			description: e.description,
			payment_method: null
		});
	}
	txs.sort((a, b) => b.date.localeCompare(a.date));
	return txs;
});
var getContactFinanceSummary_createServerFn_handler = createServerRpc({
	id: "83c1b2b27dc5957a281e1637d485671d6b72ddea44ba5e9658495d61c1757ea8",
	name: "getContactFinanceSummary",
	filename: "src/lib/finance.functions.ts"
}, (opts) => getContactFinanceSummary.__executeServer(opts));
var getContactFinanceSummary = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => objectType({ contactId: stringType().min(1) }).parse(input)).handler(getContactFinanceSummary_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	await assertContactAccess(db, context, data.contactId);
	const [projects, payments, expenses] = await Promise.all([
		col(db, "projects").find({ contact_id: data.contactId }).toArray(),
		col(db, "payments").find({ contact_id: data.contactId }).toArray(),
		col(db, "expenses").find({
			contact_id: data.contactId,
			type: "project"
		}).toArray()
	]);
	const projectRows = projects.map((p) => asProject(p));
	const paymentRows = payments.map((p) => asPayment(p));
	const expenseRows = expenses.map((e) => asExpense(e));
	const profitability = projectRows.map((project) => {
		const received = sumAmounts(paymentsForProject(paymentRows, project.id));
		const projExpenses = sumAmounts(expensesForProject(expenseRows, project.id));
		return {
			project,
			amount_received: received,
			outstanding: Math.max(0, project.value - received),
			project_expenses: projExpenses,
			estimated_profit: received - projExpenses
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
		projects: profitability
	};
});
var getProjectProfitability_createServerFn_handler = createServerRpc({
	id: "430f104bc6351d9d9646a3d1424ee071da61bd8b51689b795e71bc52754708e1",
	name: "getProjectProfitability",
	filename: "src/lib/finance.functions.ts"
}, (opts) => getProjectProfitability.__executeServer(opts));
var getProjectProfitability = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => objectType({ projectId: stringType().min(1) }).parse(input)).handler(getProjectProfitability_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const projectDoc = await col(db, "projects").findOne({ _id: data.projectId });
	if (!projectDoc) throw new Error("Project not found");
	await assertContactAccess(db, context, String(projectDoc.contact_id));
	const project = asProject(projectDoc);
	const [payments, expenses] = await Promise.all([col(db, "payments").find({ project_id: data.projectId }).toArray(), col(db, "expenses").find({
		project_id: data.projectId,
		type: "project"
	}).toArray()]);
	const paymentRows = payments.map((p) => asPayment(p));
	const expenseRows = expenses.map((e) => asExpense(e));
	const received = sumAmounts(paymentRows);
	return {
		project,
		amount_received: received,
		outstanding: Math.max(0, project.value - received),
		project_expenses: sumAmounts(expenseRows),
		estimated_profit: received - sumAmounts(expenseRows)
	};
});
//#endregion
export { createExpense_createServerFn_handler, createPayment_createServerFn_handler, createProject_createServerFn_handler, deleteExpense_createServerFn_handler, deletePayment_createServerFn_handler, deleteProject_createServerFn_handler, getContactFinanceSummary_createServerFn_handler, getFinanceDashboard_createServerFn_handler, getProjectProfitability_createServerFn_handler, listExpenses_createServerFn_handler, listPayments_createServerFn_handler, listProjects_createServerFn_handler, listTransactions_createServerFn_handler, markContactConverted_createServerFn_handler, updateExpense_createServerFn_handler, updatePayment_createServerFn_handler, updateProject_createServerFn_handler };
