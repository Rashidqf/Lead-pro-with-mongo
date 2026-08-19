import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { l as deletePayment, o as createPayment, r as PAYMENT_METHODS, x as updatePayment } from "./finance-DpBCcV6C.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-YNSXVwJV.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
import { a as ProjectSelect, t as CustomerSelect } from "./FinanceShared-D3eJqOj8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PaymentDialog-CBjew4VL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PaymentDialog({ open, onOpenChange, contacts, projects, payment, defaultContactId, defaultProjectId }) {
	const queryClient = useQueryClient();
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const [contactId, setContactId] = (0, import_react.useState)(defaultContactId ?? payment?.contact_id ?? "");
	const [projectId, setProjectId] = (0, import_react.useState)(defaultProjectId ?? payment?.project_id ?? "none");
	const [amount, setAmount] = (0, import_react.useState)(String(payment?.amount ?? ""));
	const [date, setDate] = (0, import_react.useState)(payment?.date.slice(0, 10) ?? today);
	const [method, setMethod] = (0, import_react.useState)(payment?.payment_method ?? "Cash");
	const [description, setDescription] = (0, import_react.useState)(payment?.description ?? "");
	const save = useMutation({
		mutationFn: async () => {
			const payload = {
				contact_id: contactId,
				project_id: projectId === "none" ? null : projectId,
				amount: Number(amount),
				date,
				payment_method: method,
				description: description.trim() || null
			};
			if (payment) await updatePayment({ data: {
				id: payment.id,
				...payload
			} });
			else await createPayment({ data: payload });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["contact-finance"] });
			toast.success(payment ? "Payment updated" : "Payment recorded");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async () => {
			if (!payment) return;
			await deletePayment({ data: { id: payment.id } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			toast.success("Payment deleted");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: payment ? "Edit payment" : "Record payment" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Customer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerSelect, {
						contacts,
						value: contactId,
						onChange: setContactId
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Project (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSelect, {
						projects,
						contactId,
						value: projectId,
						onChange: setProjectId,
						allowNone: true
					})] }),
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
						children: "Payment method"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: method,
						onValueChange: setMethod,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: m,
							children: m
						}, m)) })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-1.5 block text-xs",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						value: description,
						onChange: (e) => setDescription(e.target.value),
						placeholder: "Advance payment, final payment, etc."
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
				className: "gap-2 sm:justify-between",
				children: [payment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
						disabled: !contactId || !amount || save.isPending,
						children: "Save"
					})]
				})]
			})
		] })
	});
}
//#endregion
export { PaymentDialog as t };
