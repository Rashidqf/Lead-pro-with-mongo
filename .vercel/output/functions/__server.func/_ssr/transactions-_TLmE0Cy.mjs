import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as formatDateLabel, p as formatCurrency, y as transactionsQuery } from "./finance-BECJPU_k.mjs";
import { n as DateRangeSelector, o as useDefaultDateRange } from "./FinanceShared-BUgNjM61.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-_TLmE0Cy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TransactionsPage() {
	const [range, setRange] = (0, import_react.useState)(() => useDefaultDateRange());
	const { data: txs = [], isLoading } = useQuery(transactionsQuery(range));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangeSelector, {
			value: range,
			onChange: setRange
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "surface-panel shadow-card overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Project" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Amount"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				className: "text-muted-foreground",
				children: "Loading…"
			}) }) : txs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				className: "text-muted-foreground",
				children: "No transactions in this period."
			}) }) : txs.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDateLabel(tx.date) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: tx.type === "income" ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-destructive",
					children: tx.type === "income" ? "Income" : "Expense"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: tx.contact_name ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: tx.project_name ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [tx.category ?? tx.payment_method ?? "—", tx.expense_type ? ` (${tx.expense_type})` : ""] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "text-right font-medium",
					children: [tx.type === "income" ? "+" : "-", formatCurrency(tx.amount)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "max-w-[200px] truncate",
					children: tx.description ?? "—"
				})
			] }, tx.id)) })] })
		})]
	});
}
//#endregion
export { TransactionsPage as component };
