import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { o as useCrmAuth } from "./use-crm-auth-CgWrhDrj.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as Upload } from "../_libs/lucide-react.mjs";
import { n as columnsQuery, s as importContacts } from "./crm-ChEA1sUJ.mjs";
import { n as looksLikePhone, r as normalizePhone } from "./phone-C1ClWIw4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ImportContactsButton-beh3qWaf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = "";
	let quoted = false;
	const clean = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	for (let i = 0; i < clean.length; i++) {
		const char = clean[i];
		if (quoted) {
			if (char === "\"") if (clean[i + 1] === "\"") {
				field += "\"";
				i++;
			} else quoted = false;
			else field += char;
			continue;
		}
		if (char === "\"") quoted = true;
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
	const [header, ...body] = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
	if (!header) return [];
	return body.map((cells) => Object.fromEntries(header.map((key, index) => [key.trim(), cells[index] ?? ""])));
}
function pick(row, keys) {
	for (const key of keys) {
		const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
		if (!found) continue;
		const value = String(row[found] ?? "").trim();
		if (value) return value;
	}
	return null;
}
function asRows(parsed) {
	if (Array.isArray(parsed)) return parsed;
	if (parsed && typeof parsed === "object") {
		const obj = parsed;
		if (Array.isArray(obj.contacts)) return obj.contacts;
		if (Array.isArray(obj.rows)) return obj.rows;
		const collections = obj.collections;
		if (Array.isArray(collections?.contacts)) return collections.contacts;
	}
	throw new Error("JSON must be an array of contacts");
}
function parseContactImportFile(filename, text) {
	return (filename.toLowerCase().endsWith(".json") ? asRows(JSON.parse(text)) : parseCsv(text)).map((row) => {
		const phone = normalizePhone(pick(row, [
			"phone",
			"phone_number",
			"mobile"
		]));
		const rawName = pick(row, [
			"name",
			"name_or_number",
			"full_name",
			"contact"
		]);
		let name = rawName;
		if (!name || looksLikePhone(name)) name = phone || (rawName ? rawName.replace(/\s+/g, "") : null);
		return {
			name: (name || "Unnamed").slice(0, 200),
			phone,
			email: pick(row, ["email", "email_address"]),
			company: pick(row, [
				"company",
				"organization",
				"business"
			]),
			address: pick(row, [
				"address",
				"location",
				"city"
			]),
			notes: pick(row, [
				"notes",
				"note",
				"comment"
			]),
			last_activity_date: pick(row, ["last_activity_date", "last_activity"]),
			last_message: pick(row, ["last_message", "message"])?.slice(0, 8e3) ?? null
		};
	});
}
var CHUNK = 150;
function ImportContactsButton() {
	const { isAdmin } = useCrmAuth();
	const queryClient = useQueryClient();
	const fileRef = (0, import_react.useRef)(null);
	const { data: columns = [] } = useQuery(columnsQuery);
	const importFile = useMutation({
		mutationFn: async (file) => {
			const payload = parseContactImportFile(file.name, await file.text()).filter((row) => row.phone);
			if (!payload.length) throw new Error("No rows with a phone number found");
			const leads = columns.find((c) => c.name === "Leads") ?? columns[0];
			let count = 0;
			let skipped = 0;
			for (let i = 0; i < payload.length; i += CHUNK) {
				const result = await importContacts({ data: {
					column_id: leads?.id ?? null,
					rows: payload.slice(i, i + CHUNK)
				} });
				count += result.count;
				skipped += result.skipped;
			}
			return {
				count,
				skipped
			};
		},
		onSuccess: ({ count, skipped }) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			toast.success(skipped ? `Imported ${count} contacts (${skipped} skipped — already exist)` : `Imported ${count} contacts`);
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref: fileRef,
		type: "file",
		accept: ".csv,.json,text/csv,application/json",
		className: "hidden",
		onChange: (e) => {
			const file = e.target.files?.[0];
			if (file) importFile.mutate(file);
			e.target.value = "";
		}
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		onClick: () => fileRef.current?.click(),
		disabled: importFile.isPending,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1.5 h-4 w-4" }), importFile.isPending ? "Importing…" : "Import CSV"]
	})] });
}
//#endregion
export { ImportContactsButton as t };
