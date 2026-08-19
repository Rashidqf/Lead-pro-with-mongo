import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as formatPhone } from "./phone-C1ClWIw4.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { p as Plus } from "../_libs/lucide-react.mjs";
import { r as contactsQuery } from "./crm-TMob2vJe.mjs";
import { _ as projectsQuery, g as paymentsQuery, m as formatDateLabel, p as formatCurrency, v as resolveDateRange } from "./finance-DpBCcV6C.mjs";
import { n as DateRangeSelector, o as useDefaultDateRange } from "./FinanceShared-D3eJqOj8.mjs";
import { t as PaymentDialog } from "./PaymentDialog-CBjew4VL.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/income-C-31mvPm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IncomePage() {
	const [range, setRange] = (0, import_react.useState)(() => useDefaultDateRange());
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const { data: payments = [] } = useQuery(paymentsQuery);
	const { data: contacts = [] } = useQuery(contactsQuery);
	const { data: projects = [] } = useQuery(projectsQuery);
	const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]));
	const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
	const filtered = (0, import_react.useMemo)(() => {
		const { from, to } = resolveDateRange(range.preset, range.from, range.to);
		return payments.filter((p) => {
			const d = new Date(p.date);
			return d >= from && d <= to;
		});
	}, [payments, range]);
	const total = filtered.reduce((s, p) => s + p.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangeSelector, {
					value: range,
					onChange: setRange
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditing(null);
						setDialogOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), "Record payment"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-panel shadow-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Total income"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-3xl font-semibold",
					children: formatCurrency(total)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel shadow-card overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Project" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Method" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Amount"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-muted-foreground",
					children: "No payments in this period."
				}) }) : filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer",
					onClick: () => {
						setEditing(p);
						setDialogOpen(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDateLabel(p.date) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: contactMap[p.contact_id]?.name ?? "—" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: formatPhone(p.contact_phone)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.project_id ? projectMap[p.project_id]?.name ?? "—" : "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.payment_method }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-medium text-emerald-600 dark:text-emerald-400",
							children: formatCurrency(p.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.description ?? "—" })
					]
				}, p.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				contacts,
				projects,
				payment: editing
			})
		]
	});
}
//#endregion
export { IncomePage as component };
