import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as formatPhone } from "./phone-C1ClWIw4.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { f as Search, p as Plus } from "../_libs/lucide-react.mjs";
import { r as contactsQuery } from "./crm-TMob2vJe.mjs";
import { _ as projectsQuery, g as paymentsQuery, m as formatDateLabel, p as formatCurrency } from "./finance-DpBCcV6C.mjs";
import { t as ProjectDialog } from "./ProjectDialog-6WZbOuCj.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-DXK0BNng.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProjectsPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const { data: projects = [] } = useQuery(projectsQuery);
	const { data: contacts = [] } = useQuery(contactsQuery);
	const { data: payments = [] } = useQuery(paymentsQuery);
	const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]));
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		return projects.filter((p) => {
			const contact = contactMap[p.contact_id];
			if (!q) return true;
			return [
				p.name,
				contact?.name,
				contact?.phone
			].filter(Boolean).some((v) => v.toLowerCase().includes(q));
		});
	}, [
		projects,
		contactMap,
		search
	]);
	function receivedForProject(projectId) {
		return payments.filter((p) => p.project_id === projectId).reduce((s, p) => s + p.amount, 0);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Projects"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Customer projects, values, and payment status."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditing(null);
						setDialogOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), "New project"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-6 max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "pl-9",
					placeholder: "Search projects or customers…",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel shadow-card mt-6 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Project" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Value"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Received"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Outstanding"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Start" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "text-muted-foreground",
					children: "No projects yet. Create one for a converted customer."
				}) }) : filtered.map((p) => {
					const contact = contactMap[p.contact_id];
					const received = receivedForProject(p.id);
					const outstanding = Math.max(0, p.value - received);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "cursor-pointer",
						onClick: () => {
							setEditing(p);
							setDialogOpen(true);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: contact?.name ?? "—" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: formatPhone(contact?.phone ?? p.contact_phone)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "capitalize",
								children: p.status.replace("_", " ")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: formatCurrency(p.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: formatCurrency(received)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: `text-right font-medium ${outstanding > 0 ? "text-destructive" : ""}`,
								children: formatCurrency(outstanding)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.start_date ? formatDateLabel(p.start_date) : "—" })
						]
					}, p.id);
				}) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				contacts,
				project: editing
			})
		]
	});
}
//#endregion
export { ProjectsPage as component };
