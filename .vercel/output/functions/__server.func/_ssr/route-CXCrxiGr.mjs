import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { i as signOut, o as useCrmAuth } from "./use-crm-auth-CgWrhDrj.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { a as useRouterState, c as Outlet, f as Link, p as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as CircleDollarSign, _ as LogOut, b as Contact, c as Sun, h as Moon, k as Briefcase, l as SquareKanban, n as Users, v as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { c as initials } from "./crm-ChEA1sUJ.mjs";
import { n as useTheme } from "./theme-heZV5ekf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-CXCrxiGr.js
var import_jsx_runtime = require_jsx_runtime();
var links = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		adminOnly: false
	},
	{
		to: "/board",
		label: "Board",
		icon: SquareKanban,
		adminOnly: false
	},
	{
		to: "/contacts",
		label: "Contacts",
		icon: Contact,
		adminOnly: false
	},
	{
		to: "/projects",
		label: "Projects",
		icon: Briefcase,
		adminOnly: false
	},
	{
		to: "/finance",
		label: "Finance",
		icon: CircleDollarSign,
		adminOnly: false
	},
	{
		to: "/users",
		label: "Team",
		icon: Users,
		adminOnly: true
	}
];
function AppShell({ children }) {
	const { email, isAdmin, role } = useCrmAuth();
	const { theme, toggle } = useTheme();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	async function signOut$1() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-14 items-center gap-3 px-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/dashboard",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground",
							children: "LP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-sm font-semibold tracking-tight sm:block",
							children: "LeadPilot"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "ml-2 flex items-center gap-1 overflow-x-auto scrollbar-slim",
						children: links.filter((l) => !l.adminOnly || isAdmin).map((l) => {
							const active = pathname.startsWith(l.to);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: l.to,
								className: cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors", active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: l.label
								})]
							}, l.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: toggle,
								"aria-label": "Toggle theme",
								children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-2 rounded-full border border-border px-2 py-1 md:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground",
										children: initials(email ?? "?")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-[160px] truncate text-xs text-muted-foreground",
										children: email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground",
										children: role ?? "…"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: signOut$1,
								"aria-label": "Sign out",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
							})
						]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1",
			children
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
//#endregion
export { SplitComponent as component };
