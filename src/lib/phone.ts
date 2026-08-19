/** Store phones without whitespace so uniqueness is consistent. */
export function normalizePhone(value: string | null | undefined): string | null {
  if (value == null) return null;
  const phone = String(value).replace(/\s+/g, "");
  return phone.length ? phone : null;
}

export function looksLikePhone(value: string) {
  return /^[+0-9\s()-]+$/.test(value.trim());
}

