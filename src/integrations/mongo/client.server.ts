import { MongoClient, type Collection, type Db, type Document } from "mongodb";
import dns from "node:dns";

import { normalizePhone } from "@/lib/phone";
import { encodeMongoUri } from "@/lib/mongo-uri";

dns.setDefaultResultOrder("ipv4first");
if (!process.env.VERCEL) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

export type MongoDoc = Document & { _id: string };

let connecting: Promise<Db> | undefined;

export async function getDb(): Promise<Db> {
  if (!connecting) {
    connecting = connect().catch((err) => {
      connecting = undefined;
      throw err;
    });
  }
  return connecting;
}

export function col(db: Db, name: string): Collection<MongoDoc> {
  return db.collection<MongoDoc>(name);
}

async function connect(): Promise<Db> {
  const uri = encodeMongoUri(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
  const dbName = process.env.MONGODB_DB ?? "lead-flow-pro";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await Promise.all([
    col(db, "users").createIndex({ email: 1 }, { unique: true }),
    col(db, "user_roles").createIndex({ user_id: 1, role: 1 }, { unique: true }),
    col(db, "contacts").createIndex({ assigned_to: 1 }),
    col(db, "contacts").createIndex({ column_id: 1 }),
    col(db, "activities").createIndex({ created_at: -1 }),
    col(db, "call_jobs").createIndex({ user_id: 1, status: 1, created_at: 1 }),
    col(db, "call_devices").createIndex({ user_id: 1, last_seen: -1 }),
    col(db, "projects").createIndex({ contact_id: 1 }),
    col(db, "projects").createIndex({ contact_phone: 1 }),
    col(db, "payments").createIndex({ contact_id: 1, date: -1 }),
    col(db, "payments").createIndex({ project_id: 1 }),
    col(db, "payments").createIndex({ date: -1 }),
    col(db, "expenses").createIndex({ date: -1 }),
    col(db, "expenses").createIndex({ type: 1, date: -1 }),
    col(db, "expenses").createIndex({ project_id: 1 }),
    col(db, "contacts").createIndex({ converted_at: -1 }),
    col(db, "reminders").createIndex({ assigned_to: 1, status: 1, due_at: 1 }),
    col(db, "reminders").createIndex({ contact_id: 1, status: 1, due_at: 1 }),
    col(db, "reminders").createIndex({ project_id: 1, status: 1 }),
    col(db, "reminders").createIndex({ status: 1, due_at: 1, notification_sent_at: 1 }),
    ensureUniqueContactPhones(db),
  ]);
  return db;
}

export async function ensureUniqueContactPhones(db: Db) {
  const contacts = col(db, "contacts");
  const allWithPhone = contacts.find({ phone: { $type: "string" } });
  for await (const doc of allWithPhone) {
    const phone = normalizePhone(String(doc.phone));
    if (phone === doc.phone) continue;
    const taken = phone && (await contacts.findOne({ phone, _id: { $ne: doc._id } }));
    await contacts.updateOne({ _id: doc._id }, { $set: { phone: taken ? null : phone } });
  }

  const dupGroups = await contacts
    .aggregate<{ _id: string; ids: string[] }>([
      { $match: { phone: { $type: "string" } } },
      { $group: { _id: "$phone", ids: { $push: "$_id" }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();
  for (const group of dupGroups) {
    const extras = group.ids.slice(1);
    if (extras.length) {
      await contacts.updateMany({ _id: { $in: extras } }, { $set: { phone: null } });
    }
  }

  try {
    await contacts.createIndex(
      { phone: 1 },
      {
        unique: true,
        name: "contacts_phone_unique",
        partialFilterExpression: { phone: { $type: "string" } },
      },
    );
  } catch (err) {
    console.warn("Could not create unique phone index (duplicate numbers may already exist):", err);
  }
}

export function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && "$date" in value) {
    return new Date(String((value as { $date: string }).$date)).toISOString();
  }
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}
