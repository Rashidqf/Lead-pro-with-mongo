import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as supabase } from "./client-BzZDn2SK.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./label-CwWTNQoo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useCrmAuth } from "./use-crm-auth-dBRK3oH3.mjs";
import { f as Search, o as Upload, p as Plus } from "../_libs/lucide-react.mjs";
import { c as Select, d as SelectTrigger, f as SelectValue, l as SelectContent, u as SelectItem } from "./dialog-Ci354SI_.mjs";
import { i as displayName, n as columnsQuery, o as logActivity, r as contactsQuery, s as profilesQuery } from "./crm-CAfoegO2.mjs";
import { n as ContactDialog, t as AssignUserSelect } from "./ContactDialog-qVTRpTp3.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts-DTATTKOO.js
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
function ContactsPage() {
	const { isAdmin, userId } = useCrmAuth();
	const queryClient = useQueryClient();
	const fileRef = (0, import_react.useRef)(null);
	const { data: contacts = [] } = useQuery(contactsQuery);
	const { data: columns = [] } = useQuery(columnsQuery);
	const { data: profiles = [] } = useQuery(profilesQuery);
	const [search, setSearch] = (0, import_react.useState)("");
	const [assignee, setAssignee] = (0, import_react.useState)("all");
	const [columnFilter, setColumnFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [limit, setLimit] = (0, import_react.useState)(50);
	const columnMap = Object.fromEntries(columns.map((c) => [c.id, c]));
	const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		return contacts.filter((c) => {
			if (columnFilter !== "all" && c.column_id !== columnFilter) return false;
			if (assignee === "unassigned" && c.assigned_to) return false;
			if (assignee !== "all" && assignee !== "unassigned" && c.assigned_to !== assignee) return false;
			if (!q) return true;
			return [
				c.name,
				c.company,
				c.phone,
				c.email
			].filter(Boolean).some((v) => v.toLowerCase().includes(q));
		}).sort((a, b) => sort === "newest" ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at));
	}, [
		contacts,
		search,
		assignee,
		columnFilter,
		sort
	]);
	const createContact = useMutation({
		mutationFn: async () => {
			const leads = columns.find((c) => c.name === "Leads") ?? columns[0];
			const { data, error } = await supabase.from("contacts").insert({
				name: "New contact",
				column_id: leads?.id ?? null,
				created_by: userId
			}).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: (contact) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			setSelected(contact);
		},
		onError: (e) => toast.error(e.message)
	});
	const assign = useMutation({
		mutationFn: async ({ id, userIdValue }) => {
			const { error } = await supabase.from("contacts").update({ assigned_to: userIdValue }).eq("id", id);
			if (error) throw error;
			if (userId) await logActivity(userId, id, "assigned", displayName(userIdValue ? profileMap[userIdValue] : null));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast.success("Assignment updated");
		},
		onError: (e) => toast.error(e.message)
	});
	const importCsv = useMutation({
		mutationFn: async (file) => {
			const rows = parseCsv(await file.text());
			const leads = columns.find((c) => c.name === "Leads") ?? columns[0];
			const pick = (row, keys) => {
				for (const key of keys) {
					const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
					if (found && row[found]?.trim()) return row[found].trim();
				}
				return null;
			};
			const payload = rows.map((row) => ({
				name: pick(row, [
					"name",
					"name_or_number",
					"full_name",
					"contact"
				]) ?? pick(row, ["phone", "phone_number"]) ?? "Unnamed",
				phone: pick(row, [
					"phone",
					"phone_number",
					"mobile"
				]),
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
				last_message: pick(row, ["last_message", "message"]),
				column_id: leads?.id ?? null,
				created_by: userId
			})).filter((r) => r.name);
			if (!payload.length) throw new Error("No rows found in that CSV");
			for (let i = 0; i < payload.length; i += 200) {
				const { error } = await supabase.from("contacts").insert(payload.slice(i, i + 200));
				if (error) throw error;
			}
			if (userId) await logActivity(userId, null, "imported", `${payload.length} contacts`);
			return payload.length;
		},
		onSuccess: (count) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast.success(`Imported ${count} contacts`);
		},
		onError: (e) => toast.error(e.message)
	});
	const live = selected ? contacts.find((c) => c.id === selected.id) ?? selected : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Contacts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [filtered.length, " records"]
				})] }), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileRef,
							type: "file",
							accept: ".csv,text/csv",
							className: "hidden",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (file) importCsv.mutate(file);
								e.target.value = "";
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => fileRef.current?.click(),
							disabled: importCsv.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1.5 h-4 w-4" }), importCsv.isPending ? "Importing…" : "Import CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => createContact.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), "New contact"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-[240px] flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search name, company, phone, email…",
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: columnFilter,
						onValueChange: setColumnFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[170px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All statuses"
						}), columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.id,
							children: c.name
						}, c.id))] })]
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: assignee,
						onValueChange: setAssignee,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[180px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All assignees"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "unassigned",
								children: "Unassigned"
							}),
							profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.id,
								children: displayName(p)
							}, p.id))
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: sort,
						onValueChange: (v) => setSort(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[140px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "newest",
							children: "Newest first"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "oldest",
							children: "Oldest first"
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-panel shadow-card mt-4 overflow-x-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Company" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Phone" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Assigned" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Created" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.slice(0, limit).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "cursor-pointer",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								onClick: () => setSelected(c),
								children: c.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: () => setSelected(c),
								children: c.company ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: () => setSelected(c),
								children: c.phone ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: () => setSelected(c),
								children: c.email ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: () => setSelected(c),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground",
									children: c.column_id ? columnMap[c.column_id]?.name ?? "—" : "—"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "w-[210px]",
								children: isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignUserSelect, {
									profiles,
									value: c.assigned_to,
									onChange: (v) => assign.mutate({
										id: c.id,
										userIdValue: v
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: displayName(c.assigned_to ? profileMap[c.assigned_to] : null)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "whitespace-nowrap text-xs text-muted-foreground",
								children: new Date(c.created_at).toLocaleDateString()
							})
						]
					}, c.id)) })] }),
					filtered.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border p-3 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => setLimit((l) => l + 50),
							children: "Load more"
						})
					}),
					filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: "No contacts match."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactDialog, {
				contact: live,
				columns,
				profiles,
				open: !!selected,
				onOpenChange: (o) => !o && setSelected(null)
			})
		]
	});
}
//#endregion
export { ContactsPage as component };
