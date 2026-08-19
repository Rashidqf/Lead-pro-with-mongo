import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hash } from "bcryptjs";
import dns from "node:dns";
import { MongoClient } from "mongodb";
import { encodeMongoUri } from "./mongo-uri.mjs";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const out = {};
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
  } catch {
    // no .env
  }
  return out;
}

function normalizePhone(value) {
  if (value == null) return null;
  const phone = String(value).replace(/\s+/g, "");
  return phone.length ? phone : null;
}

function revive(value) {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === "object") {
    if (typeof value.$date === "string") return new Date(value.$date);
    const next = {};
    for (const [k, v] of Object.entries(value)) next[k] = revive(v);
    return next;
  }
  return value;
}

function readCollection(name) {
  const raw = JSON.parse(readFileSync(join(root, "mongo-export", "collections", `${name}.json`), "utf8"));
  return revive(raw);
}

const env = { ...loadEnv(join(root, ".env")), ...process.env };
const uri = encodeMongoUri(env.MONGODB_URI || "mongodb://127.0.0.1:27017");
const dbName = env.MONGODB_DB || "lead-flow-pro";
const password = env.IMPORT_PASSWORD || "rashidkg01@gmail.com";

if (!password || password.length < 8) {
  console.error("Set IMPORT_PASSWORD (min 8 chars) for the two existing users, then re-run.");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const tables = ["board_columns", "profiles", "user_roles", "contacts", "activities"];
for (const name of tables) {
  let docs = readCollection(name);
  if (name === "contacts") {
    docs = docs.map((doc) => ({ ...doc, phone: normalizePhone(doc.phone) }));
    const seen = new Set();
    let cleared = 0;
    for (const doc of docs) {
      if (!doc.phone) continue;
      if (seen.has(doc.phone)) {
        doc.phone = null;
        cleared += 1;
      } else {
        seen.add(doc.phone);
      }
    }
    if (cleared) console.log(`contacts: cleared ${cleared} duplicate phone numbers`);
  }
  await db.collection(name).deleteMany({});
  if (docs.length) await db.collection(name).insertMany(docs);
  console.log(`${name}: ${docs.length}`);
}

const passwordHash = await hash(password, 10);
const now = new Date();
const profiles = await db.collection("profiles").find({}).toArray();
await db.collection("users").deleteMany({});
for (const profile of profiles) {
  const email = String(profile.email || "").toLowerCase();
  if (!email) continue;
  await db.collection("users").insertOne({
    _id: profile._id,
    email,
    passwordHash,
    created_at: profile.created_at instanceof Date ? profile.created_at : now,
  });
  console.log(`user login: ${email}`);
}

await db.collection("users").createIndex({ email: 1 }, { unique: true });
await client.close();
console.log(`Imported into ${dbName}`);
