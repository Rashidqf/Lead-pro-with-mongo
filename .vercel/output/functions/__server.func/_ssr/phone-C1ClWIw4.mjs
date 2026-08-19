//#region node_modules/.nitro/vite/services/ssr/assets/phone-C1ClWIw4.js
/** Normalize phone to canonical form (+923001234567). Strips whitespace and unifies PK formats. */
function normalizePhone(value) {
	if (value == null) return null;
	const raw = String(value).replace(/\s+/g, "");
	if (!raw.length) return null;
	const digits = raw.replace(/\D/g, "");
	if (!digits.length) return null;
	if (digits.startsWith("0") && digits.length >= 10) return `+92${digits.slice(1)}`;
	if (digits.startsWith("92") && digits.length >= 11) return `+${digits}`;
	if (raw.startsWith("+")) return `+${digits}`;
	return raw;
}
function looksLikePhone(value) {
	return /^[+0-9\s()-]+$/.test(value.trim());
}
/** Display-friendly format for PK numbers */
function formatPhone(value) {
	if (!value) return "—";
	const n = normalizePhone(value);
	if (!n) return value;
	if (n.startsWith("+92") && n.length === 13) return `+92 ${n.slice(3, 6)} ${n.slice(6)}`;
	return n;
}
//#endregion
export { looksLikePhone as n, normalizePhone as r, formatPhone as t };
