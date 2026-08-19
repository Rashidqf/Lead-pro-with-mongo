import { readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
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

function looksLikePhone(value) {
  return /^[+0-9\s()-]+$/.test(String(value).trim());
}

function pick(row, keys) {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
    if (found && String(row[found] ?? "").trim()) return String(row[found]).trim();
  }
  return null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const clean = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (quoted) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((r) => r.some((cell) => String(cell).trim() !== ""));
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(header.map((key, index) => [String(key).trim(), cells[index] ?? ""])),
  );
}

function readRows(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const ext = extname(filePath).toLowerCase();
  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.contacts)) return parsed.contacts;
    if (Array.isArray(parsed.rows)) return parsed.rows;
    if (Array.isArray(parsed.collections?.contacts)) return parsed.collections.contacts;
    throw new Error("JSON must be an array, or { contacts | rows | collections.contacts }");
  }
  return parseCsv(raw);
}

function toContact(row, columnId, now) {
  const phone = normalizePhone(pick(row, ["phone", "phone_number", "mobile"]));
  const rawName = pick(row, ["name", "name_or_number", "full_name", "contact"]);
  let name = rawName;
  if (!name || looksLikePhone(name)) name = phone || (rawName ? rawName.replace(/\s+/g, "") : null);
  if (!name) name = "Unnamed";
  const id = randomUUID();
  return {
    _id: id,
    id,
    name: name.slice(0, 200),
    phone,
    email: pick(row, ["email", "email_address"]),
    company: pick(row, ["company", "organization", "business"]),
    address: pick(row, ["address", "location", "city"]),
    notes: pick(row, ["notes", "note", "comment"]),
    tags: Array.isArray(row.tags) ? row.tags : [],
    last_activity_date: pick(row, ["last_activity_date", "last_activity"]),
    last_message: pick(row, ["last_message", "message"]),
    column_id: columnId,
    assigned_to: null,
    created_by: null,
    position: 0,
    created_at: now,
    updated_at: now,
  };
}

const fileArg = process.argv[2];
if (!fileArg) {
  console.error(`Usage:
  npm run import:contacts -- path/to/contacts.csv
  npm run import:contacts -- path/to/contacts.json

CSV columns: name_or_number, phone_number, last_activity_date, last_message
Existing phone numbers are skipped.`);
  process.exit(1);
}

const filePath = isAbsolute(fileArg) ? fileArg : resolve(process.cwd(), fileArg);
const env = { ...loadEnv(join(root, ".env")), ...process.env };
const uri = encodeMongoUri(env.MONGODB_URI || "mongodb://127.0.0.1:27017");
const dbName = env.MONGODB_DB || "lead-flow-pro";

const rows = readRows(filePath);
if (!rows.length) {
  console.error("No rows found in that file.");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const contacts = db.collection("contacts");

const leads =
  (await db.collection("board_columns").findOne({ name: "Leads" })) ??
  (await db.collection("board_columns").find().sort({ position: 1 }).limit(1).next());
const columnId = leads?._id ?? leads?.id ?? null;

const now = new Date();
const docs = rows.map((row) => toContact(row, columnId, now));
const existing = await contacts
  .find({ phone: { $type: "string" } })
  .project({ phone: 1 })
  .toArray();
const taken = new Set(existing.map((doc) => normalizePhone(doc.phone)).filter(Boolean));
const seen = new Set();
const fresh = [];
let skippedExisting = 0;
let skippedNoPhone = 0;
let skippedInFile = 0;

for (const doc of docs) {
  if (!doc.phone) {
    skippedNoPhone += 1;
    continue;
  }
  if (taken.has(doc.phone)) {
    skippedExisting += 1;
    continue;
  }
  if (seen.has(doc.phone)) {
    skippedInFile += 1;
    continue;
  }
  seen.add(doc.phone);
  fresh.push(doc);
}

if (fresh.length) await contacts.insertMany(fresh);

console.log(`file: ${filePath}`);
console.log(`created: ${fresh.length}`);
console.log(`skipped (already in db): ${skippedExisting}`);
console.log(`skipped (duplicate in file): ${skippedInFile}`);
console.log(`skipped (no phone): ${skippedNoPhone}`);

await client.close();
