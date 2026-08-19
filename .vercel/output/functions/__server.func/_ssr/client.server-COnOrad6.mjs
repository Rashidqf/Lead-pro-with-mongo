import { r as __exportAll } from "../_runtime.mjs";
import { r as normalizePhone } from "./phone-C1ClWIw4.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as require_lib } from "../_libs/mongodb.mjs";
import dns from "node:dns";
//#region node_modules/.nitro/vite/services/ssr/assets/client.server-COnOrad6.js
var client_server_COnOrad6_exports = /* @__PURE__ */ __exportAll({
	i: () => toIso,
	n: () => col,
	r: () => getDb,
	t: () => client_server_exports
});
var import_lib = require_lib();
/** Encode user/password so special characters like @ in the password don't break the URI. */
function encodeMongoUri(uri) {
	const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/i);
	if (!match) return uri;
	const [, protocol, rest] = match;
	const at = rest.lastIndexOf("@");
	if (at < 0) return uri;
	const userinfo = rest.slice(0, at);
	const host = rest.slice(at + 1);
	const colon = userinfo.indexOf(":");
	if (colon < 0) return `${protocol}${encodePart(userinfo)}@${host}`;
	return `${protocol}${encodePart(userinfo.slice(0, colon))}:${encodePart(userinfo.slice(colon + 1))}@${host}`;
}
function encodePart(value) {
	try {
		return encodeURIComponent(decodeURIComponent(value));
	} catch {
		return encodeURIComponent(value);
	}
}
var client_server_exports = /* @__PURE__ */ __exportAll$1({
	col: () => col,
	ensureUniqueContactPhones: () => ensureUniqueContactPhones,
	getDb: () => getDb,
	toIso: () => toIso
});
dns.setDefaultResultOrder("ipv4first");
if (!process.env.VERCEL) dns.setServers(["1.1.1.1", "8.8.8.8"]);
var connecting;
async function getDb() {
	if (!connecting) connecting = connect().catch((err) => {
		connecting = void 0;
		throw err;
	});
	return connecting;
}
function col(db, name) {
	return db.collection(name);
}
async function connect() {
	const uri = encodeMongoUri(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
	const dbName = process.env.MONGODB_DB ?? "lead-flow-pro";
	const client = new import_lib.MongoClient(uri);
	await client.connect();
	const db = client.db(dbName);
	await Promise.all([
		col(db, "users").createIndex({ email: 1 }, { unique: true }),
		col(db, "user_roles").createIndex({
			user_id: 1,
			role: 1
		}, { unique: true }),
		col(db, "contacts").createIndex({ assigned_to: 1 }),
		col(db, "contacts").createIndex({ column_id: 1 }),
		col(db, "activities").createIndex({ created_at: -1 }),
		col(db, "call_jobs").createIndex({
			user_id: 1,
			status: 1,
			created_at: 1
		}),
		col(db, "call_devices").createIndex({
			user_id: 1,
			last_seen: -1
		}),
		col(db, "projects").createIndex({ contact_id: 1 }),
		col(db, "projects").createIndex({ contact_phone: 1 }),
		col(db, "payments").createIndex({
			contact_id: 1,
			date: -1
		}),
		col(db, "payments").createIndex({ project_id: 1 }),
		col(db, "payments").createIndex({ date: -1 }),
		col(db, "expenses").createIndex({ date: -1 }),
		col(db, "expenses").createIndex({
			type: 1,
			date: -1
		}),
		col(db, "expenses").createIndex({ project_id: 1 }),
		col(db, "contacts").createIndex({ converted_at: -1 }),
		ensureUniqueContactPhones(db)
	]);
	return db;
}
async function ensureUniqueContactPhones(db) {
	const contacts = col(db, "contacts");
	const allWithPhone = contacts.find({ phone: { $type: "string" } });
	for await (const doc of allWithPhone) {
		const phone = normalizePhone(String(doc.phone));
		if (phone === doc.phone) continue;
		const taken = phone && await contacts.findOne({
			phone,
			_id: { $ne: doc._id }
		});
		await contacts.updateOne({ _id: doc._id }, { $set: { phone: taken ? null : phone } });
	}
	const dupGroups = await contacts.aggregate([
		{ $match: { phone: { $type: "string" } } },
		{ $group: {
			_id: "$phone",
			ids: { $push: "$_id" },
			n: { $sum: 1 }
		} },
		{ $match: { n: { $gt: 1 } } }
	]).toArray();
	for (const group of dupGroups) {
		const extras = group.ids.slice(1);
		if (extras.length) await contacts.updateMany({ _id: { $in: extras } }, { $set: { phone: null } });
	}
	try {
		await contacts.createIndex({ phone: 1 }, {
			unique: true,
			name: "contacts_phone_unique",
			partialFilterExpression: { phone: { $type: "string" } }
		});
	} catch (err) {
		console.warn("Could not create unique phone index (duplicate numbers may already exist):", err);
	}
}
function toIso(value) {
	if (value instanceof Date) return value.toISOString();
	if (value && typeof value === "object" && "$date" in value) return new Date(String(value.$date)).toISOString();
	if (typeof value === "string") return new Date(value).toISOString();
	return (/* @__PURE__ */ new Date()).toISOString();
}
//#endregion
export { toIso as i, col as n, getDb as r, client_server_COnOrad6_exports as t };
