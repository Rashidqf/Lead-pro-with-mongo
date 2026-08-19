import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { p as Plus } from "../_libs/lucide-react.mjs";
import { r as contactsQuery } from "./crm-TMob2vJe.mjs";
import { _ as projectsQuery, d as expensesQuery, m as formatDateLabel, p as formatCurrency, v as resolveDateRange } from "./finance-DpBCcV6C.mjs";
import { n as DateRangeSelector, o as useDefaultDateRange } from "./FinanceShared-D3eJqOj8.mjs";
import { t as ExpenseDialog } from "./ExpenseDialog-CSNZoKvB.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/expenses-j8AqAXI-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExpensesPage() {
	const [range, setRange] = (0, import_react.useState)(() => useDefaultDateRange());
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const { data: expenses = [] } = useQuery(expensesQuery);
	const { data: contacts = [] } = useQuery(contactsQuery);
	const { data: projects = [] } = useQuery(projectsQuery);
	const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
	const filtered = (0, import_react.useMemo)(() => {
		const { from, to } = resolveDateRange(range.preset, range.from, range.to);
		return expenses.filter((e) => {
			const d = new Date(e.date);
			return d >= from && d <= to;
		});
	}, [expenses, range]);
	const businessTotal = filtered.filter((e) => e.type === "business").reduce((s, e) => s + e.amount, 0);
	const projectTotal = filtered.filter((e) => e.type === "project").reduce((s, e) => s + e.amount, 0);
	const personalTotal = filtered.filter((e) => e.type === "personal").reduce((s, e) => s + e.amount, 0);
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), "Add expense"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-panel shadow-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Business"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(businessTotal)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Affects net profit"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-panel shadow-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Project"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(projectTotal)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Reduces project profit"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-panel shadow-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Personal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(personalTotal)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Tracked separately"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel shadow-card overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Project" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Amount"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-muted-foreground",
					children: "No expenses in this period."
				}) }) : filtered.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer",
					onClick: () => {
						setEditing(e);
						setDialogOpen(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDateLabel(e.date) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "capitalize",
							children: e.type
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: e.category }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: e.project_id ? projectMap[e.project_id]?.name ?? "—" : "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-medium text-destructive",
							children: formatCurrency(e.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: e.description ?? "—" })
					]
				}, e.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				contacts,
				projects,
				expense: editing
			})
		]
	});
}
//#endregion
export { ExpensesPage as component };
