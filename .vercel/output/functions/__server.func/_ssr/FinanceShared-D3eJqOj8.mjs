import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { i as format } from "../_libs/date-fns.mjs";
import { t as DATE_RANGE_LABELS } from "./finance-DpBCcV6C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FinanceShared-D3eJqOj8.js
var import_jsx_runtime = require_jsx_runtime();
var PRESETS = [
	"today",
	"last7",
	"last30",
	"thisMonth",
	"prevMonth",
	"custom"
];
function DateRangeSelector({ value, onChange, className }) {
	function setPreset(preset) {
		if (preset === "custom") {
			onChange({
				...value,
				preset
			});
			return;
		}
		onChange({
			preset,
			from: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
			to: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1",
			children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: value.preset === preset ? "default" : "outline",
				onClick: () => setPreset(preset),
				children: DATE_RANGE_LABELS[preset]
			}, preset))
		}), value.preset === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					className: "w-auto",
					value: value.from.slice(0, 10),
					onChange: (e) => onChange({
						...value,
						from: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "to"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					className: "w-auto",
					value: value.to.slice(0, 10),
					onChange: (e) => onChange({
						...value,
						to: e.target.value
					})
				})
			]
		})]
	});
}
function useDefaultDateRange() {
	return {
		preset: "last30",
		from: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
		to: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
	};
}
function MetricCard({ label, value, sub, negative }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-panel shadow-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-3 text-3xl font-semibold tracking-tight", negative && "text-destructive"),
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			})
		]
	});
}
function FinanceSubNav() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-wrap gap-1 border-b border-border pb-3",
		children: [
			{
				to: "/finance",
				label: "Overview",
				exact: true
			},
			{
				to: "/finance/transactions",
				label: "Transactions",
				exact: false
			},
			{
				to: "/finance/income",
				label: "Income",
				exact: false
			},
			{
				to: "/finance/expenses",
				label: "Expenses",
				exact: false
			},
			{
				to: "/finance/outstanding",
				label: "Outstanding",
				exact: false
			}
		].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceNavLink, {
			to: l.to,
			exact: l.exact,
			children: l.label
		}, l.to))
	});
}
function FinanceNavLink({ to, exact, children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const active = exact ? pathname === to : pathname.startsWith(to);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"),
		children
	});
}
function CustomerSelect({ contacts, value, onChange, placeholder = "Select customer" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: value || void 0,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: contacts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
			value: c.id,
			children: [c.name, c.phone ? ` · ${c.phone}` : ""]
		}, c.id)) })]
	});
}
function ProjectSelect({ projects, contactId, value, onChange, allowNone }) {
	const filtered = contactId ? projects.filter((p) => p.contact_id === contactId) : projects;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: value || (allowNone ? "none" : void 0),
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select project" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [allowNone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: "none",
			children: "No project"
		}), filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: p.id,
			children: p.name
		}, p.id))] })]
	});
}
//#endregion
export { ProjectSelect as a, MetricCard as i, DateRangeSelector as n, useDefaultDateRange as o, FinanceSubNav as r, CustomerSelect as t };
