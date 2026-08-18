import { r as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-Dp-V928M.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CESJ7luu.mjs";
import { i as stringType, n as enumType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { p as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-4K9aSq_X.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { n as Label, t as Input } from "./label-CwWTNQoo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useCrmAuth } from "./use-crm-auth-dBRK3oH3.mjs";
import { i as UserPlus, s as Trash2, y as KeyRound } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, c as Select, d as SelectTrigger, f as SelectValue, i as DialogFooter, l as SelectContent, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog, u as SelectItem } from "./dialog-Ci354SI_.mjs";
import { c as rolesQuery, i as displayName, r as contactsQuery, s as profilesQuery } from "./crm-CAfoegO2.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CyFoctdv.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-BLXr6fpf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var adminCreateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().min(1).max(120),
	role: enumType(["admin", "user"])
}).parse(input)).handler(createSsrRpc("9e2c7b3651fdf5f47a11420a03b87a06f8054b52bbc825f423a1beeb88080ac9"));
var adminUpdateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	userId: stringType().uuid(),
	fullName: stringType().trim().min(1).max(120).optional(),
	role: enumType(["admin", "user"]).optional(),
	isActive: booleanType().optional(),
	password: stringType().min(8).max(72).optional()
}).parse(input)).handler(createSsrRpc("9b71e5a434778dc97380077d3f09e026ed75e736a126e93db3d54f114e7e6592"));
var adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ userId: stringType().uuid() }).parse(input)).handler(createSsrRpc("75454526e81445e210b3752ed6012b474b177f745b67b452ea06088e76834860"));
function UsersPage() {
	const { isAdmin, loading, userId } = useCrmAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: profiles = [] } = useQuery(profilesQuery);
	const { data: roles = [] } = useQuery(rolesQuery);
	const { data: contacts = [] } = useQuery(contactsQuery);
	const createUser = useServerFn(adminCreateUser);
	const updateUser = useServerFn(adminUpdateUser);
	const deleteUser = useServerFn(adminDeleteUser);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		fullName: "",
		email: "",
		password: "",
		role: "user"
	});
	const [resetFor, setResetFor] = (0, import_react.useState)(null);
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!loading && !isAdmin) navigate({
			to: "/dashboard",
			replace: true
		});
	}, [
		loading,
		isAdmin,
		navigate
	]);
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["profiles"] });
		queryClient.invalidateQueries({ queryKey: ["user-roles"] });
		queryClient.invalidateQueries({ queryKey: ["contacts"] });
	};
	const create = useMutation({
		mutationFn: () => createUser({ data: {
			email: form.email,
			password: form.password,
			fullName: form.fullName,
			role: form.role
		} }),
		onSuccess: () => {
			toast.success("User created");
			setOpen(false);
			setForm({
				fullName: "",
				email: "",
				password: "",
				role: "user"
			});
			refresh();
		},
		onError: (e) => toast.error(e.message)
	});
	const update = useMutation({
		mutationFn: (input) => updateUser({ data: input }),
		onSuccess: () => {
			toast.success("User updated");
			setResetFor(null);
			setNewPassword("");
			refresh();
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: (id) => deleteUser({ data: { userId: id } }),
		onSuccess: () => {
			toast.success("User deleted");
			refresh();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isAdmin) return null;
	const roleOf = (id) => roles.find((r) => r.user_id === id)?.role ?? "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Team"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [profiles.length, " members"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1.5 h-4 w-4" }), "New user"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create user" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-1.5",
									value: form.fullName,
									onChange: (e) => setForm({
										...form,
										fullName: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-1.5",
									type: "email",
									value: form.email,
									onChange: (e) => setForm({
										...form,
										email: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Temporary password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-1.5",
									value: form.password,
									onChange: (e) => setForm({
										...form,
										password: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.role,
									onValueChange: (v) => setForm({
										...form,
										role: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "mt-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "user",
										children: "User"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "admin",
										children: "Admin"
									})] })]
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => create.mutate(),
							disabled: create.isPending,
							children: "Create user"
						}) })
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel shadow-card mt-6 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Member" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Role" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Assigned" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Active" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: displayName(p)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: p.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: roleOf(p.id),
						onValueChange: (v) => update.mutate({
							userId: p.id,
							role: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[110px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "user",
							children: "User"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "admin",
							children: "Admin"
						})] })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: contacts.filter((c) => c.assigned_to === p.id).length }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: p.is_active,
						onCheckedChange: (checked) => update.mutate({
							userId: p.id,
							isActive: checked
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Reset password",
								onClick: () => setResetFor(p.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Delete user",
								disabled: p.id === userId,
								onClick: () => remove.mutate(p.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
							})]
						})
					})
				] }, p.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!resetFor,
				onOpenChange: (o) => !o && setResetFor(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Reset password" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "New password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1.5",
						value: newPassword,
						onChange: (e) => setNewPassword(e.target.value),
						placeholder: "At least 8 characters"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => resetFor && update.mutate({
							userId: resetFor,
							password: newPassword
						}),
						disabled: update.isPending || newPassword.length < 8,
						children: "Update password"
					}) })
				] })
			})
		]
	});
}
//#endregion
export { UsersPage as component };
