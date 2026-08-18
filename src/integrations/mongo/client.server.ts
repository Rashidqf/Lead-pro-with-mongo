import { MongoClient, type Collection, type Db, type Document } from "mongodb";

export type MongoDoc = Document & { _id: string };

let connecting: Promise<Db> | undefined;

export async function getDb(): Promise<Db> {
  if (!connecting) connecting = connect();
  return connecting;
}

export function col(db: Db, name: string): Collection<MongoDoc> {
  return db.collection<MongoDoc>(name);
}

async function connect(): Promise<Db> {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
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
  ]);
  return db;
}

export function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && "$date" in value) {
    return new Date(String((value as { $date: string }).$date)).toISOString();
  }
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}

