import { o as __toESM } from "../_runtime.mjs";
import { i as createServerFn } from "./server-Yvyy7qRX.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as requireAuth } from "./auth-middleware-a5hCx0S0.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { r as normalizePhone } from "./phone-C1ClWIw4.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B95rxBNs.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCrmAuth } from "./router-CL8vSWs-.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { D as Check, f as Search, i as UserPlus, m as Phone, p as Plus, s as Trash2, w as ChevronsUpDown } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { a as deleteContact, d as updateContact, o as displayName } from "./crm-TMob2vJe.mjs";
import { _ as projectsQuery, h as markContactConverted, i as contactFinanceQuery, p as formatCurrency } from "./finance-DpBCcV6C.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-YNSXVwJV.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
import { t as ExpenseDialog } from "./ExpenseDialog-CSNZoKvB.mjs";
import { t as PaymentDialog } from "./PaymentDialog-CBjew4VL.mjs";
import { t as ProjectDialog } from "./ProjectDialog-6WZbOuCj.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ContactDialog-lVsgtKX-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
function AssignUserSelect({ profiles, value, onChange, disabled, className }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const current = profiles.find((p) => p.id === value) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				role: "combobox",
				disabled,
				className: cn("h-9 w-full justify-between text-sm font-normal", className),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 truncate",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5 text-muted-foreground" }), current ? displayName(current) : "Unassigned"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "h-3.5 w-3.5 opacity-50" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-64 p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: "Search users…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No users found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
				value: "unassigned",
				onSelect: () => {
					onChange(null);
					setOpen(false);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", value ? "opacity-0" : "opacity-100") }), "Unassigned"]
			}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
				value: `${p.full_name ?? ""} ${p.email ?? ""}`,
				onSelect: () => {
					onChange(p.id);
					setOpen(false);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", value === p.id ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate",
					children: [displayName(p), !p.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1 text-xs text-muted-foreground",
						children: "(inactive)"
					})]
				})]
			}, p.id))] })] })] })
		})]
	});
}
var requestCall = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ contactId: stringType().min(1) }).parse(input)).handler(createSsrRpc("af8d5ce532265c5057354b6e9faf5d4e36b9d95278dfabe4cfce3f532a6f53c4"));
var callDeviceStatus = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("ac4e13da8e4968eec30692cc7389ec4f751b4b97f5a9e5e6fe119142099dd7aa"));
function CallLeadButton({ contact, className, compact }) {
	const queryClient = useQueryClient();
	const { data: device } = useQuery({
		queryKey: ["call-device"],
		queryFn: () => callDeviceStatus(),
		refetchInterval: 15e3
	});
	const call = useMutation({
		mutationFn: async () => {
			const result = await requestCall({ data: { contactId: contact.id } });
			if (result.mode === "tel") window.location.href = `tel:${result.phone}`;
			return result;
		},
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			if (result.mode === "device") toast.success("Calling from your Android phone…");
		},
		onError: (e) => toast.error(e.message)
	});
	if (!contact.phone) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		size: compact ? "sm" : "default",
		variant: compact ? "secondary" : "default",
		title: "Call",
		className: cn(compact && "h-7 px-2 text-xs", className),
		disabled: call.isPending,
		onPointerDown: (e) => e.stopPropagation(),
		onClick: (e) => {
			e.stopPropagation();
			call.mutate();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: cn("h-3.5 w-3.5", !compact && "mr-1.5") }), compact ? null : device?.online ? "Call from phone" : "Call"]
	});
}
function ContactFinancePanel({ contact }) {
	const queryClient = useQueryClient();
	const { data: summary, isLoading } = useQuery(contactFinanceQuery(contact.id));
	const { data: allProjects = [] } = useQuery(projectsQuery);
	const [projectOpen, setProjectOpen] = (0, import_react.useState)(false);
	const [paymentOpen, setPaymentOpen] = (0, import_react.useState)(false);
	const [expenseOpen, setExpenseOpen] = (0, import_react.useState)(false);
	const contactProjects = allProjects.filter((p) => p.contact_id === contact.id);
	const convert = useMutation({
		mutationFn: () => markContactConverted({ data: { contactId: contact.id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
			toast.success("Lead marked as converted");
		},
		onError: (e) => toast.error(e.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading financial summary…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 border-t border-border pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold tracking-tight",
					children: "Financial summary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => convert.mutate(),
					disabled: convert.isPending,
					children: "Mark as converted"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Projects",
						value: String(summary?.total_projects ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Project value",
						value: formatCurrency(summary?.total_project_value ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Received",
						value: formatCurrency(summary?.total_received ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Outstanding",
						value: formatCurrency(summary?.outstanding ?? 0),
						negative: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Project expenses",
						value: formatCurrency(summary?.project_expenses ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Net profit",
						value: formatCurrency(summary?.net_profit ?? 0),
						negative: (summary?.net_profit ?? 0) < 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setProjectOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3.5 w-3.5" }), "Add project"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setPaymentOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3.5 w-3.5" }), "Record payment"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setExpenseOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3.5 w-3.5" }), "Project expense"]
					})
				]
			}),
			summary?.projects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Project" }),
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Profit"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: summary.projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.project.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: formatCurrency(p.project.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: formatCurrency(p.amount_received)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: formatCurrency(p.outstanding)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: `text-right ${p.estimated_profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`,
					children: formatCurrency(p.estimated_profit)
				})
			] }, p.project.id)) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No projects for this customer yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDialog, {
				open: projectOpen,
				onOpenChange: setProjectOpen,
				contacts: [contact],
				defaultContactId: contact.id
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentDialog, {
				open: paymentOpen,
				onOpenChange: setPaymentOpen,
				contacts: [contact],
				projects: contactProjects,
				defaultContactId: contact.id
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseDialog, {
				open: expenseOpen,
				onOpenChange: setExpenseOpen,
				contacts: [contact],
				projects: contactProjects,
				defaultType: "project"
			})
		]
	});
}
function Stat({ label, value, negative }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-panel p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 text-lg font-semibold ${negative ? "text-destructive" : ""}`,
			children: value
		})]
	});
}
function ContactDialog({ contact, columns, profiles, open, onOpenChange }) {
	const { isAdmin } = useCrmAuth();
	const queryClient = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!contact) return setForm(null);
		setForm({
			name: contact.name,
			company: contact.company ?? "",
			phone: contact.phone ?? "",
			email: contact.email ?? "",
			address: contact.address ?? "",
			notes: contact.notes ?? "",
			tags: (contact.tags ?? []).join(", "),
			column_id: contact.column_id ?? "",
			assigned_to: contact.assigned_to
		});
	}, [contact]);
	const save = useMutation({
		mutationFn: async () => {
			if (!contact || !form) return;
			const payload = {
				name: form.name.trim().slice(0, 200) || "Untitled",
				company: form.company.trim() || null,
				phone: normalizePhone(form.phone),
				email: form.email.trim() || null,
				address: form.address.trim() || null,
				notes: form.notes.trim() || null,
				tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
				column_id: form.column_id || null,
				...isAdmin ? { assigned_to: form.assigned_to } : {}
			};
			await updateContact({ data: {
				id: contact.id,
				...payload
			} });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			toast.success("Contact saved");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async () => {
			if (!contact) return;
			await deleteContact({ data: {
				id: contact.id,
				name: contact.name
			} });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast.success("Contact deleted");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	if (!contact || !form) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] max-w-2xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-lg",
					children: contact.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Created ", new Date(contact.created_at).toLocaleString()] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Company",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.company,
								onChange: (e) => setForm({
									...form,
									company: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.phone,
									onChange: (e) => setForm({
										...form,
										phone: e.target.value
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallLeadButton, { contact: {
									...contact,
									phone: form.phone || contact.phone
								} })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.email,
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Address",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.address,
								onChange: (e) => setForm({
									...form,
									address: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.column_id,
								onValueChange: (v) => setForm({
									...form,
									column_id: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select status" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Assigned user",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignUserSelect, {
								profiles,
								value: form.assigned_to,
								disabled: !isAdmin,
								onChange: (v) => setForm({
									...form,
									assigned_to: v
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tags (comma separated)",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.tags,
								onChange: (e) => setForm({
									...form,
									tags: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 4,
								value: form.notes,
								onChange: (e) => setForm({
									...form,
									notes: e.target.value
								})
							})
						}),
						contact.last_message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Last imported message",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "surface-panel max-h-40 overflow-y-auto whitespace-pre-wrap p-3 text-xs text-muted-foreground",
								children: contact.last_message
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactFinancePanel, { contact }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:justify-between",
					children: [isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						onClick: () => remove.mutate(),
						disabled: remove.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1.5 h-4 w-4" }), "Delete"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => save.mutate(),
							disabled: save.isPending,
							children: "Save changes"
						})]
					})]
				})
			]
		})
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "mb-1.5 block text-xs font-medium text-muted-foreground",
			children: label
		}), children]
	});
}
//#endregion
export { CallLeadButton as n, ContactDialog as r, AssignUserSelect as t };
