import { compare } from "bcryptjs";

import { col, getDb } from "@/integrations/mongo/client.server";
import { normalizePhone } from "@/lib/phone";
import { signToken, verifyToken } from "@/integrations/mongo/session.server";

const DEVICE_ONLINE_MS = 90_000;

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "Authorization, Content-Type",
      "access-control-allow-methods": "GET, POST, OPTIONS",
    },
  });
}

export function corsPreflight() {
  return jsonResponse({ ok: true });
}

export async function companionLogin(emailRaw: string, password: string, deviceName: string) {
  const db = await getDb();
  const email = emailRaw.trim().toLowerCase();
  const user = await col(db, "users").findOne({ email });
  if (!user?.passwordHash || !(await compare(password, String(user.passwordHash)))) {
    throw new Error("Invalid email or password");
  }
  const profile = await col(db, "profiles").findOne({ _id: user._id });
  if (profile && profile.is_active === false) throw new Error("This account is disabled");
  const userId = String(user._id);
  const token = await signToken(userId, email);
  const deviceId = crypto.randomUUID();
  const now = new Date();
  await col(db, "call_devices").insertOne({
    _id: deviceId,
    id: deviceId,
    user_id: userId,
    name: deviceName.slice(0, 80) || "Android",
    last_seen: new Date(0),
    created_at: now,
  });
  return { token, userId, deviceId, email };
}

export async function authCompanion(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new Error("Unauthorized");
  return verifyToken(token);
}

export async function heartbeatDevice(userId: string, deviceId?: string) {
  const db = await getDb();
  const now = new Date();
  if (deviceId) {
    await col(db, "call_devices").updateOne({ _id: deviceId, user_id: userId }, { $set: { last_seen: now } });
    return;
  }
  const latest = await col(db, "call_devices")
    .find({ user_id: userId })
    .sort({ last_seen: -1 })
    .limit(1)
    .next();
  if (latest) await col(db, "call_devices").updateOne({ _id: latest._id }, { $set: { last_seen: now } });
}

export async function userHasOnlineDevice(userId: string) {
  const db = await getDb();
  const since = new Date(Date.now() - DEVICE_ONLINE_MS);
  const device = await col(db, "call_devices").findOne({ user_id: userId, last_seen: { $gte: since } });
  return Boolean(device);
}

export async function enqueueCall(opts: {
  userId: string;
  contactId: string;
  phone: string;
  name: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = new Date();
  await col(db, "call_jobs").insertOne({
    _id: id,
    id,
    user_id: opts.userId,
    contact_id: opts.contactId,
    phone: opts.phone,
    name: opts.name,
    status: "pending",
    created_at: now,
    updated_at: now,
  });
  return id;
}

export async function claimNextCall(userId: string, deviceId?: string) {
  await heartbeatDevice(userId, deviceId);
  const db = await getDb();
  const now = new Date();
  const result = await col(db, "call_jobs").findOneAndUpdate(
    { user_id: userId, status: "pending" },
    { $set: { status: "claimed", claimed_at: now, updated_at: now } },
    { sort: { created_at: 1 }, returnDocument: "after" },
  );
  const job = result as Record<string, unknown> | null;
  if (!job) return null;
  return {
    jobId: String(job._id ?? job.id),
    contactId: String(job.contact_id),
    phone: String(job.phone),
    name: String(job.name ?? ""),
  };
}

export async function updateCallJob(userId: string, jobId: string, status: string, detail?: string) {
  const db = await getDb();
  const existing = await col(db, "call_jobs").findOne({ _id: jobId, user_id: userId });
  if (!existing) throw new Error("Call job not found");
  await col(db, "call_jobs").updateOne(
    { _id: jobId },
    { $set: { status, detail: detail ?? null, updated_at: new Date() } },
  );
  await col(db, "activities").insertOne({
    _id: crypto.randomUUID(),
    id: crypto.randomUUID(),
    user_id: userId,
    contact_id: existing.contact_id ?? null,
    action: status === "dialed" ? "called" : `call_${status}`,
    detail: detail ?? String(existing.phone ?? ""),
    created_at: new Date(),
  });
}

export async function requestOutboundCall(actor: {
  userId: string;
  isAdmin: boolean;
}, contactId: string) {
  const db = await getDb();
  const contact = await col(db, "contacts").findOne({ _id: contactId });
  if (!contact) throw new Error("Contact not found");
  if (!actor.isAdmin && contact.assigned_to !== actor.userId) throw new Error("Forbidden");
  const phone = normalizePhone(String(contact.phone ?? ""));
  if (!phone) throw new Error("This contact has no phone number");

  const online = await userHasOnlineDevice(actor.userId);
  if (online) {
    await enqueueCall({
      userId: actor.userId,
      contactId,
      phone,
      name: String(contact.name),
    });
    return { mode: "device" as const, phone };
  }

  await col(db, "activities").insertOne({
    _id: crypto.randomUUID(),
    id: crypto.randomUUID(),
    user_id: actor.userId,
    contact_id: contactId,
    action: "called",
    detail: phone,
    created_at: new Date(),
  });
  return { mode: "tel" as const, phone };
}
