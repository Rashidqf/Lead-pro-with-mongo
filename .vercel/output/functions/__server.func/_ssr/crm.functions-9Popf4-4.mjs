import { i as createServerFn } from "./server-Yvyy7qRX.mjs";
import { t as createServerRpc } from "./createServerRpc-ChGssE9S.mjs";
import { t as requireAuth } from "./auth-middleware-a5hCx0S0.mjs";
import { a as objectType, o as stringType, t as arrayType } from "../_libs/zod.mjs";
import { r as normalizePhone } from "./phone-C1ClWIw4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crm.functions-9Popf4-4.js
function asProfile(doc) {
	const { toIso } = requireIso();
	return {
		id: String(doc._id ?? doc.id),
		email: doc.email ?? null,
		full_name: doc.full_name ?? null,
		is_active: doc.is_active !== false,
		created_at: toIso(doc.created_at)
	};
}
function requireIso() {
	return { toIso(value) {
		if (value instanceof Date) return value.toISOString();
		if (value && typeof value === "object" && "$date" in value) return new Date(String(value.$date)).toISOString();
		if (typeof value === "string") return new Date(value).toISOString();
		return (/* @__PURE__ */ new Date()).toISOString();
	} };
}
function asColumn(doc) {
	return {
		id: String(doc._id ?? doc.id),
		name: String(doc.name),
		position: Number(doc.position ?? 0),
		color: String(doc.color ?? "slate")
	};
}
function asContact(doc) {
	const { toIso } = requireIso();
	return {
		id: String(doc._id ?? doc.id),
		name: String(doc.name),
		company: doc.company ?? null,
		phone: normalizePhone(doc.phone ?? null),
		email: doc.email ?? null,
		address: doc.address ?? null,
		notes: doc.notes ?? null,
		tags: Array.isArray(doc.tags) ? doc.tags : [],
		last_activity_date: doc.last_activity_date ?? null,
		last_message: doc.last_message ?? null,
		column_id: doc.column_id ?? null,
		assigned_to: doc.assigned_to ?? null,
		position: Number(doc.position ?? 0),
		created_at: toIso(doc.created_at),
		updated_at: toIso(doc.updated_at)
	};
}
function asActivity(doc) {
	const { toIso } = requireIso();
	return {
		id: String(doc._id ?? doc.id),
		contact_id: doc.contact_id ?? null,
		user_id: doc.user_id ?? null,
		action: String(doc.action),
		detail: doc.detail ?? null,
		created_at: toIso(doc.created_at)
	};
}
function contactFilter(actor) {
	return actor.isAdmin ? {} : { assigned_to: actor.userId };
}
var DUPLICATE_PHONE_MESSAGE = "A contact with this phone number already exists";
function isDuplicateKeyError(err) {
	return Boolean(err && typeof err === "object" && "code" in err && err.code === 11e3);
}
async function assertPhoneUnique(db, phone, excludeId) {
	if (!phone) return;
	const { col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	if (await col(db, "contacts").findOne({
		phone,
		...excludeId ? { _id: { $ne: excludeId } } : {}
	})) throw new Error(DUPLICATE_PHONE_MESSAGE);
}
async function writeActivity(db, actor, contactId, action, detail) {
	const { col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const id = crypto.randomUUID();
	await col(db, "activities").insertOne({
		_id: id,
		id,
		user_id: actor.userId,
		contact_id: contactId,
		action,
		detail: detail ?? null,
		created_at: /* @__PURE__ */ new Date()
	});
}
var listColumns_createServerFn_handler = createServerRpc({
	id: "1dfe8286723ad68513985344bae71ef5161a12ef90fe1af926050d00fc327e5c",
	name: "listColumns",
	filename: "src/lib/crm.functions.ts"
}, (opts) => listColumns.__executeServer(opts));
var listColumns = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listColumns_createServerFn_handler, async () => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	return (await col(await getDb(), "board_columns").find({}).sort({ position: 1 }).toArray()).map((row) => asColumn(row));
});
var listContacts_createServerFn_handler = createServerRpc({
	id: "f7c0d4ef4a116099fb6777d9d80918e4fc46627bb955213f5c9172f4df277d29",
	name: "listContacts",
	filename: "src/lib/crm.functions.ts"
}, (opts) => listContacts.__executeServer(opts));
var listContacts = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listContacts_createServerFn_handler, async ({ context }) => {
	const { getDb, col, ensureUniqueContactPhones } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	await ensureUniqueContactPhones(db);
	return (await col(db, "contacts").find(contactFilter(context)).sort({ created_at: -1 }).limit(5e3).toArray()).map((row) => asContact(row));
});
var listProfiles_createServerFn_handler = createServerRpc({
	id: "562b681e97f6cd661cbded1494b3ffcde8ff2dc7b3d43045e03389a4651c628f",
	name: "listProfiles",
	filename: "src/lib/crm.functions.ts"
}, (opts) => listProfiles.__executeServer(opts));
var listProfiles = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listProfiles_createServerFn_handler, async () => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	return (await col(await getDb(), "profiles").find({}).sort({ created_at: 1 }).toArray()).map((row) => asProfile(row));
});
var listRoles_createServerFn_handler = createServerRpc({
	id: "4093c083f0a0feb13a7950d5a977e863ce5c6891170f412acaae9fa073b59ace",
	name: "listRoles",
	filename: "src/lib/crm.functions.ts"
}, (opts) => listRoles.__executeServer(opts));
var listRoles = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listRoles_createServerFn_handler, async () => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	return (await col(await getDb(), "user_roles").find({}).toArray()).map((row) => ({
		user_id: String(row.user_id),
		role: row.role
	}));
});
var listActivities_createServerFn_handler = createServerRpc({
	id: "020f2277d383629f656c9c814017f36cefa9587417dcec9209b87a5ce4069b1d",
	name: "listActivities",
	filename: "src/lib/crm.functions.ts"
}, (opts) => listActivities.__executeServer(opts));
var listActivities = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(listActivities_createServerFn_handler, async ({ context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const filter = context.isAdmin ? {} : { user_id: context.userId };
	return (await col(db, "activities").find(filter).sort({ created_at: -1 }).limit(25).toArray()).map((row) => asActivity(row));
});
var createContact_createServerFn_handler = createServerRpc({
	id: "67f30739b56d33d81615096598f26391339ed7e6cd55a611d2e5da764bf5f4ff",
	name: "createContact",
	filename: "src/lib/crm.functions.ts"
}, (opts) => createContact.__executeServer(opts));
var createContact = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	name: stringType().min(1).max(200),
	column_id: stringType().nullable().optional()
}).parse(input)).handler(createContact_createServerFn_handler, async ({ data, context }) => {
	if (!context.isAdmin) throw new Error("Forbidden: admin access required");
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	const doc = {
		_id: id,
		id,
		name: data.name,
		company: null,
		phone: null,
		email: null,
		address: null,
		notes: null,
		tags: [],
		last_activity_date: null,
		last_message: null,
		column_id: data.column_id ?? null,
		assigned_to: null,
		created_by: context.userId,
		position: 0,
		created_at: now,
		updated_at: now
	};
	await col(db, "contacts").insertOne(doc);
	return asContact(doc);
});
var updateContact_createServerFn_handler = createServerRpc({
	id: "32b718d232b289bc999893878c89d6dc4de1f6a5f9623e680b04f0e95ecac80b",
	name: "updateContact",
	filename: "src/lib/crm.functions.ts"
}, (opts) => updateContact.__executeServer(opts));
var updateContact = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().min(1).max(200).optional(),
	company: stringType().nullable().optional(),
	phone: stringType().nullable().optional(),
	email: stringType().nullable().optional(),
	address: stringType().nullable().optional(),
	notes: stringType().nullable().optional(),
	tags: arrayType(stringType()).optional(),
	column_id: stringType().nullable().optional(),
	assigned_to: stringType().nullable().optional()
}).parse(input)).handler(updateContact_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "contacts").findOne({ _id: data.id });
	if (!existing) throw new Error("Contact not found");
	if (!context.isAdmin && existing.assigned_to !== context.userId) throw new Error("Forbidden");
	const { id, ...rest } = data;
	const patch = { updated_at: /* @__PURE__ */ new Date() };
	for (const [key, value] of Object.entries(rest)) if (value !== void 0) patch[key] = value;
	if (patch.phone !== void 0) {
		patch.phone = normalizePhone(patch.phone);
		await assertPhoneUnique(db, patch.phone, id);
	}
	if (!context.isAdmin) delete patch.assigned_to;
	let action = "updated";
	if (patch.column_id !== void 0 && patch.column_id !== existing.column_id) action = "moved";
	else if (patch.assigned_to !== void 0 && patch.assigned_to !== existing.assigned_to) action = "assigned";
	let detail = patch.name ?? String(existing.name);
	if (action === "assigned") {
		const assigneeId = patch.assigned_to;
		if (!assigneeId) detail = "Unassigned";
		else {
			const profile = await col(db, "profiles").findOne({ _id: assigneeId });
			detail = String(profile?.full_name || profile?.email || "Unknown user");
		}
	}
	try {
		await col(db, "contacts").updateOne({ _id: id }, { $set: patch });
	} catch (err) {
		if (isDuplicateKeyError(err)) throw new Error(DUPLICATE_PHONE_MESSAGE);
		throw err;
	}
	await writeActivity(db, context, id, action, detail);
	return asContact(await col(db, "contacts").findOne({ _id: id }));
});
var deleteContact_createServerFn_handler = createServerRpc({
	id: "c994a06d82bbb5909398ffaaecb3f6237ffe38ff45ea3ad1c423728864dd4034",
	name: "deleteContact",
	filename: "src/lib/crm.functions.ts"
}, (opts) => deleteContact.__executeServer(opts));
var deleteContact = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().optional()
}).parse(input)).handler(deleteContact_createServerFn_handler, async ({ data, context }) => {
	if (!context.isAdmin) throw new Error("Forbidden: admin access required");
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const existing = await col(db, "contacts").findOne({ _id: data.id });
	if (!existing) throw new Error("Contact not found");
	await col(db, "contacts").deleteOne({ _id: data.id });
	await writeActivity(db, context, null, "deleted", data.name ?? String(existing.name));
	return { ok: true };
});
var importContacts_createServerFn_handler = createServerRpc({
	id: "90fd0627501b4731a8e4e47c028d281953f4d91f9a9ea121f7b88b49a3cabe6b",
	name: "importContacts",
	filename: "src/lib/crm.functions.ts"
}, (opts) => importContacts.__executeServer(opts));
var importContacts = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	column_id: stringType().nullable().optional(),
	rows: arrayType(objectType({
		name: stringType().min(1).max(200),
		phone: stringType().nullable().optional(),
		email: stringType().nullable().optional(),
		company: stringType().nullable().optional(),
		address: stringType().nullable().optional(),
		notes: stringType().nullable().optional(),
		last_activity_date: stringType().nullable().optional(),
		last_message: stringType().nullable().optional()
	}))
}).parse(input)).handler(importContacts_createServerFn_handler, async ({ data, context }) => {
	if (!context.isAdmin) throw new Error("Forbidden: admin access required");
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const now = /* @__PURE__ */ new Date();
	const docs = data.rows.map((row) => {
		const id = crypto.randomUUID();
		return {
			_id: id,
			id,
			name: row.name,
			phone: normalizePhone(row.phone),
			email: row.email ?? null,
			company: row.company ?? null,
			address: row.address ?? null,
			notes: row.notes ?? null,
			tags: [],
			last_activity_date: row.last_activity_date ?? null,
			last_message: row.last_message ?? null,
			column_id: data.column_id ?? null,
			assigned_to: null,
			created_by: context.userId,
			position: 0,
			created_at: now,
			updated_at: now
		};
	});
	const phones = [...new Set(docs.map((d) => d.phone).filter((p) => Boolean(p)))];
	const existing = phones.length ? await col(db, "contacts").find({ phone: { $in: phones } }).project({ phone: 1 }).toArray() : [];
	const taken = new Set(existing.map((row) => String(row.phone)));
	const seen = /* @__PURE__ */ new Set();
	const uniqueDocs = [];
	let skipped = 0;
	for (const doc of docs) {
		if (doc.phone) {
			if (taken.has(doc.phone) || seen.has(doc.phone)) {
				skipped += 1;
				continue;
			}
			seen.add(doc.phone);
		}
		uniqueDocs.push(doc);
	}
	try {
		if (uniqueDocs.length) await col(db, "contacts").insertMany(uniqueDocs);
	} catch (err) {
		if (isDuplicateKeyError(err)) throw new Error(DUPLICATE_PHONE_MESSAGE);
		throw err;
	}
	await writeActivity(db, context, null, "imported", `${uniqueDocs.length} contacts`);
	return {
		count: uniqueDocs.length,
		skipped
	};
});
var logContactActivity_createServerFn_handler = createServerRpc({
	id: "9a245b487d9034e49d33459bdb5cd83a0382c41531d733685a568c0b124dd914",
	name: "logContactActivity",
	filename: "src/lib/crm.functions.ts"
}, (opts) => logContactActivity.__executeServer(opts));
var logContactActivity = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	contactId: stringType().nullable(),
	action: stringType().min(1).max(80),
	detail: stringType().optional()
}).parse(input)).handler(logContactActivity_createServerFn_handler, async ({ data, context }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	await writeActivity(await getDb(), context, data.contactId, data.action, data.detail);
	return { ok: true };
});
//#endregion
export { createContact_createServerFn_handler, deleteContact_createServerFn_handler, importContacts_createServerFn_handler, listActivities_createServerFn_handler, listColumns_createServerFn_handler, listContacts_createServerFn_handler, listProfiles_createServerFn_handler, listRoles_createServerFn_handler, logContactActivity_createServerFn_handler, updateContact_createServerFn_handler };
