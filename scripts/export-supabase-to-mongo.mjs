import { mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

function loadEnv(path) {
  const out = {};
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
  return out;
}

const env = loadEnv(envPath);
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const publishableKey =
  env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const key = serviceRoleKey || publishableKey;
const exportEmail =
  process.env.SUPABASE_EXPORT_EMAIL || env.SUPABASE_EXPORT_EMAIL;
const exportPassword =
  process.env.SUPABASE_EXPORT_PASSWORD || env.SUPABASE_EXPORT_PASSWORD;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or API key in .env");
  process.exit(1);
}

const usingServiceRole = Boolean(serviceRoleKey);

function isIsoDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  );
}

function toMongoDoc(row) {
  const doc = { _id: row.id, ...row };
  for (const [k, v] of Object.entries(doc)) {
    if (isIsoDate(v)) doc[k] = { $date: v };
  }
  return doc;
}

async function fetchAll(supabase, table) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, to);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

const TABLES = [
  "board_columns",
  "profiles",
  "user_roles",
  "contacts",
  "activities",
];

function isNewSupabaseApiKey(value) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, header) =>
        headers.set(header, value),
      );
    }
    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

const supabase = createClient(url, key, {
  global: { fetch: createSupabaseFetch(key) },
  auth: { persistSession: false, autoRefreshToken: false },
});

if (!usingServiceRole) {
  if (!exportEmail || !exportPassword) {
    console.error(
      "RLS is on. Set SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_EXPORT_EMAIL + SUPABASE_EXPORT_PASSWORD.",
    );
    process.exit(1);
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: exportEmail,
    password: exportPassword,
  });
  if (error || !data.session) {
    console.error(`Sign-in failed: ${error?.message ?? "no session"}`);
    process.exit(1);
  }
  console.log(`Signed in as ${data.user.email} (${data.user.id})`);
} else {
  console.log("Using SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)");
}

const collections = {};
const counts = {};

for (const table of TABLES) {
  const rows = await fetchAll(supabase, table);
  collections[table] = rows.map(toMongoDoc);
  counts[table] = rows.length;
  console.log(`${table}: ${rows.length} rows`);
}

const outDir = join(root, "mongo-export");
const collectionsDir = join(outDir, "collections");
await mkdir(collectionsDir, { recursive: true });

const dump = {
  exportedAt: new Date().toISOString(),
  source: url,
  usedServiceRole: usingServiceRole,
  counts,
  collections,
};

await writeFile(join(outDir, "dump.json"), JSON.stringify(dump, null, 2));

for (const [name, docs] of Object.entries(collections)) {
  await writeFile(
    join(collectionsDir, `${name}.json`),
    JSON.stringify(docs, null, 2),
  );
}

await writeFile(
  join(outDir, "import.mongodb.js"),
  `// Run in mongosh after: use lead-flow-pro
// mongosh --file mongo-export/import.mongodb.js
const data = ${JSON.stringify(dump.collections)};
for (const [name, docs] of Object.entries(data)) {
  db[name].drop();
  if (docs.length) db[name].insertMany(docs);
  print(name + ": " + db[name].countDocuments() + " docs");
}
`,
);

console.log(`\nSaved to ${outDir}`);
console.log("Expected dashboard counts: activities 124, board_columns 7, contacts 552, profiles 2, user_roles 2");
if (!usingServiceRole && (counts.contacts === 0 || counts.contacts < 552)) {
  console.warn(
    "\nWARNING: row counts look incomplete. Add SUPABASE_SERVICE_ROLE_KEY to .env and re-run.",
  );
}
