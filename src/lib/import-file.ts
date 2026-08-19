import { parseCsv } from "@/lib/csv";
import { looksLikePhone, normalizePhone } from "@/lib/phone";

export type ImportContactRow = {
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  last_activity_date: string | null;
  last_message: string | null;
};

function pick(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
    if (!found) continue;
    const value = String(row[found] ?? "").trim();
    if (value) return value;
  }
  return null;
}

function asRows(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.contacts)) return obj.contacts as Record<string, unknown>[];
    if (Array.isArray(obj.rows)) return obj.rows as Record<string, unknown>[];
    const collections = obj.collections as { contacts?: unknown } | undefined;
    if (Array.isArray(collections?.contacts)) return collections.contacts as Record<string, unknown>[];
  }
  throw new Error("JSON must be an array of contacts");
}

export function parseContactImportFile(filename: string, text: string): ImportContactRow[] {
  const raw = filename.toLowerCase().endsWith(".json") ? asRows(JSON.parse(text)) : parseCsv(text);
  return raw.map((row) => {
    const phone = normalizePhone(pick(row, ["phone", "phone_number", "mobile"]));
    const rawName = pick(row, ["name", "name_or_number", "full_name", "contact"]);
    let name = rawName;
    if (!name || looksLikePhone(name)) name = phone || (rawName ? rawName.replace(/\s+/g, "") : null);
    return {
      name: (name || "Unnamed").slice(0, 200),
      phone,
      email: pick(row, ["email", "email_address"]),
      company: pick(row, ["company", "organization", "business"]),
      address: pick(row, ["address", "location", "city"]),
      notes: pick(row, ["notes", "note", "comment"]),
      last_activity_date: pick(row, ["last_activity_date", "last_activity"]),
      last_message: pick(row, ["last_message", "message"])?.slice(0, 8000) ?? null,
    };
  });
}
