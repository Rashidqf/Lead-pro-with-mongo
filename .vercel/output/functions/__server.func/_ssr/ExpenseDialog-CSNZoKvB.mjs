import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { a as createExpense, b as updateExpense, c as deleteExpense, n as EXPENSE_CATEGORIES } from "./finance-DpBCcV6C.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-YNSXVwJV.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
import { a as ProjectSelect, t as CustomerSelect } from "./FinanceShared-D3eJqOj8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ExpenseDialog-CSNZoKvB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExpenseDialog({ open, onOpenChange, contacts, projects, expense, defaultType }) {
	const queryClient = useQueryClient();
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const [type, setType] = (0, import_react.useState)(expense?.type ?? defaultType ?? "business");
	const [category, setCategory] = (0, import_react.useState)(expense?.category ?? "Other");
	const [contactId, setContactId] = (0, import_react.useState)(expense?.contact_id ?? "");
	const [projectId, setProjectId] = (0, import_react.useState)(expense?.project_id ?? "");
	const [amount, setAmount] = (0, import_react.useState)(String(expense?.amount ?? ""));
	const [date, setDate] = (0, import_react.useState)(expense?.date.slice(0, 10) ?? today);
	const [description, setDescription] = (0, import_react.useState)(expense?.description ?? "");
	const save = useMutation({
		mutationFn: async () => {
			const payload = {
				date,
				type,
				category,
				contact_id: type === "project" ? contactId : null,
				project_id: type === "project" ? projectId : null,
				amount: Number(amount),
				description: description.trim() || null
			};
			if (expense) await updateExpense({ data: {
				id: expense.id,
				...payload
			} });
			else await createExpense({ data: payload });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["contact-finance"] });
			toast.success(expense ? "Expense updated" : "Expense recorded");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async () => {
			if (!expense) return;
			await deleteExpense({ data: { id: expense.id } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			toast.success("Expense deleted");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: expense ? "Edit expense" : "Add expense" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: type,
						onValueChange: (v) => setType(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "business",
								children: "Business"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "project",
								children: "Project"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "personal",
								children: "Personal"
							})
						] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: category,
						onValueChange: setCategory,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: EXPENSE_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c,
							children: c
						}, c)) })]
					})] }),
					type === "project" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Customer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerSelect, {
						contacts,
						value: contactId,
						onChange: setContactId
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Project"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSelect, {
						projects,
						contactId,
						value: projectId,
						onChange: setProjectId
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "mb-1.5 block text-xs",
							children: "Amount (Rs.)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							value: amount,
							onChange: (e) => setAmount(e.target.value)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "mb-1.5 block text-xs",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value)
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						value: description,
						onChange: (e) => setDescription(e.target.value)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
				className: "gap-2 sm:justify-between",
				children: [expense ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: () => remove.mutate(),
					disabled: remove.isPending,
					children: "Delete"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => save.mutate(),
						disabled: !amount || save.isPending || type === "project" && (!contactId || !projectId),
						children: "Save"
					})]
				})]
			})
		] })
	});
}
//#endregion
export { ExpenseDialog as t };
