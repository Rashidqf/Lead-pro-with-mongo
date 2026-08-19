/** Normalize phone to canonical form (+923001234567). Strips whitespace and unifies PK formats. */
export function normalizePhone(value: string | null | undefined): string | null {
  if (value == null) return null;
  const raw = String(value).replace(/\s+/g, "");
  if (!raw.length) return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits.length) return null;

  // Pakistan: 03001234567 → +923001234567
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+92${digits.slice(1)}`;
  }
  // Pakistan: 923001234567 or +923001234567
  if (digits.startsWith("92") && digits.length >= 11) {
    return `+${digits}`;
  }
  // Other international numbers with leading +
  if (raw.startsWith("+")) {
    return `+${digits}`;
  }

  return raw;
}

export function looksLikePhone(value: string) {
  return /^[+0-9\s()-]+$/.test(value.trim());
}

/** Display-friendly format for PK numbers */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "—";
  const n = normalizePhone(value);
  if (!n) return value;
  if (n.startsWith("+92") && n.length === 13) {
    return `+92 ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return n;
}
