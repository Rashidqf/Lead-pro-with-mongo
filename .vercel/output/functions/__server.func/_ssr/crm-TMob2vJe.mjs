import { i as createServerFn } from "./server-Yvyy7qRX.mjs";
import { t as requireAuth } from "./auth-middleware-a5hCx0S0.mjs";
import { a as objectType, o as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B95rxBNs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crm-TMob2vJe.js
var listColumns = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("1dfe8286723ad68513985344bae71ef5161a12ef90fe1af926050d00fc327e5c"));
var listContacts = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("f7c0d4ef4a116099fb6777d9d80918e4fc46627bb955213f5c9172f4df277d29"));
var listProfiles = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("562b681e97f6cd661cbded1494b3ffcde8ff2dc7b3d43045e03389a4651c628f"));
var listRoles = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("4093c083f0a0feb13a7950d5a977e863ce5c6891170f412acaae9fa073b59ace"));
var listActivities = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("020f2277d383629f656c9c814017f36cefa9587417dcec9209b87a5ce4069b1d"));
var createContact = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	name: stringType().min(1).max(200),
	column_id: stringType().nullable().optional()
}).parse(input)).handler(createSsrRpc("67f30739b56d33d81615096598f26391339ed7e6cd55a611d2e5da764bf5f4ff"));
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
}).parse(input)).handler(createSsrRpc("32b718d232b289bc999893878c89d6dc4de1f6a5f9623e680b04f0e95ecac80b"));
var deleteContact = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().optional()
}).parse(input)).handler(createSsrRpc("c994a06d82bbb5909398ffaaecb3f6237ffe38ff45ea3ad1c423728864dd4034"));
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
}).parse(input)).handler(createSsrRpc("90fd0627501b4731a8e4e47c028d281953f4d91f9a9ea121f7b88b49a3cabe6b"));
createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	contactId: stringType().nullable(),
	action: stringType().min(1).max(80),
	detail: stringType().optional()
}).parse(input)).handler(createSsrRpc("9a245b487d9034e49d33459bdb5cd83a0382c41531d733685a568c0b124dd914"));
var columnsQuery = {
	queryKey: ["board-columns"],
	queryFn: () => listColumns()
};
var contactsQuery = {
	queryKey: ["contacts"],
	queryFn: () => listContacts()
};
var profilesQuery = {
	queryKey: ["profiles"],
	queryFn: () => listProfiles()
};
var rolesQuery = {
	queryKey: ["user-roles"],
	queryFn: () => listRoles()
};
var activitiesQuery = {
	queryKey: ["activities"],
	queryFn: () => listActivities()
};
function displayName(profile) {
	if (!profile) return "Unassigned";
	return profile.full_name || profile.email || "Unknown user";
}
function initials(value) {
	const clean = value.replace(/[^a-zA-Z0-9 ]/g, "").trim();
	if (!clean) return "?";
	const parts = clean.split(/\s+/);
	return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
//#endregion
export { deleteContact as a, initials as c, updateContact as d, createContact as i, profilesQuery as l, columnsQuery as n, displayName as o, contactsQuery as r, importContacts as s, activitiesQuery as t, rolesQuery as u };
