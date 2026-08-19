import { t as compare } from "../_libs/bcryptjs.mjs";
import { r as normalizePhone } from "./phone-C1ClWIw4.mjs";
import { n as col, r as getDb } from "./client.server-COnOrad6.mjs";
import { n as signToken, r as verifyToken } from "./session.server-DKz0L2Oo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companion.server-1Pv96LAS.js
var DEVICE_ONLINE_MS = 9e4;
function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json",
			"access-control-allow-origin": "*",
			"access-control-allow-headers": "Authorization, Content-Type",
			"access-control-allow-methods": "GET, POST, OPTIONS"
		}
	});
}
function corsPreflight() {
	return jsonResponse({ ok: true });
}
async function companionLogin(emailRaw, password, deviceName) {
	const db = await getDb();
	const email = emailRaw.trim().toLowerCase();
	const user = await col(db, "users").findOne({ email });
	if (!user?.passwordHash || !await compare(password, String(user.passwordHash))) throw new Error("Invalid email or password");
	const profile = await col(db, "profiles").findOne({ _id: user._id });
	if (profile && profile.is_active === false) throw new Error("This account is disabled");
	const userId = String(user._id);
	const token = await signToken(userId, email);
	const deviceId = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	await col(db, "call_devices").insertOne({
		_id: deviceId,
		id: deviceId,
		user_id: userId,
		name: deviceName.slice(0, 80) || "Android",
		last_seen: /* @__PURE__ */ new Date(0),
		created_at: now
	});
	return {
		token,
		userId,
		deviceId,
		email
	};
}
async function authCompanion(request) {
	const header = request.headers.get("authorization") ?? "";
	const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
	if (!token) throw new Error("Unauthorized");
	return verifyToken(token);
}
async function heartbeatDevice(userId, deviceId) {
	const db = await getDb();
	const now = /* @__PURE__ */ new Date();
	if (deviceId) {
		await col(db, "call_devices").updateOne({
			_id: deviceId,
			user_id: userId
		}, { $set: { last_seen: now } });
		return;
	}
	const latest = await col(db, "call_devices").find({ user_id: userId }).sort({ last_seen: -1 }).limit(1).next();
	if (latest) await col(db, "call_devices").updateOne({ _id: latest._id }, { $set: { last_seen: now } });
}
async function userHasOnlineDevice(userId) {
	const db = await getDb();
	const since = /* @__PURE__ */ new Date(Date.now() - DEVICE_ONLINE_MS);
	const device = await col(db, "call_devices").findOne({
		user_id: userId,
		last_seen: { $gte: since }
	});
	return Boolean(device);
}
async function enqueueCall(opts) {
	const db = await getDb();
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	await col(db, "call_jobs").insertOne({
		_id: id,
		id,
		user_id: opts.userId,
		contact_id: opts.contactId,
		phone: opts.phone,
		name: opts.name,
		status: "pending",
		created_at: now,
		updated_at: now
	});
	return id;
}
async function claimNextCall(userId, deviceId) {
	await heartbeatDevice(userId, deviceId);
	const db = await getDb();
	const now = /* @__PURE__ */ new Date();
	const job = await col(db, "call_jobs").findOneAndUpdate({
		user_id: userId,
		status: "pending"
	}, { $set: {
		status: "claimed",
		claimed_at: now,
		updated_at: now
	} }, {
		sort: { created_at: 1 },
		returnDocument: "after"
	});
	if (!job) return null;
	return {
		jobId: String(job._id ?? job.id),
		contactId: String(job.contact_id),
		phone: String(job.phone),
		name: String(job.name ?? "")
	};
}
async function updateCallJob(userId, jobId, status, detail) {
	const db = await getDb();
	const existing = await col(db, "call_jobs").findOne({
		_id: jobId,
		user_id: userId
	});
	if (!existing) throw new Error("Call job not found");
	await col(db, "call_jobs").updateOne({ _id: jobId }, { $set: {
		status,
		detail: detail ?? null,
		updated_at: /* @__PURE__ */ new Date()
	} });
	await col(db, "activities").insertOne({
		_id: crypto.randomUUID(),
		id: crypto.randomUUID(),
		user_id: userId,
		contact_id: existing.contact_id ?? null,
		action: status === "dialed" ? "called" : `call_${status}`,
		detail: detail ?? String(existing.phone ?? ""),
		created_at: /* @__PURE__ */ new Date()
	});
}
async function requestOutboundCall(actor, contactId) {
	const db = await getDb();
	const contact = await col(db, "contacts").findOne({ _id: contactId });
	if (!contact) throw new Error("Contact not found");
	if (!actor.isAdmin && contact.assigned_to !== actor.userId) throw new Error("Forbidden");
	const phone = normalizePhone(String(contact.phone ?? ""));
	if (!phone) throw new Error("This contact has no phone number");
	if (await userHasOnlineDevice(actor.userId)) {
		await enqueueCall({
			userId: actor.userId,
			contactId,
			phone,
			name: String(contact.name)
		});
		return {
			mode: "device",
			phone
		};
	}
	await col(db, "activities").insertOne({
		_id: crypto.randomUUID(),
		id: crypto.randomUUID(),
		user_id: actor.userId,
		contact_id: contactId,
		action: "called",
		detail: phone,
		created_at: /* @__PURE__ */ new Date()
	});
	return {
		mode: "tel",
		phone
	};
}
//#endregion
export { jsonResponse as a, userHasOnlineDevice as c, corsPreflight as i, claimNextCall as n, requestOutboundCall as o, companionLogin as r, updateCallJob as s, authCompanion as t };
