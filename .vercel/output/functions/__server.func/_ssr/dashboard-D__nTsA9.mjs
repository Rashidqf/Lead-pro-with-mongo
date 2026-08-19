import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useCrmAuth } from "./router-CL8vSWs-.mjs";
import { C as CircleDashed, a as UserCheck, r as UsersRound, x as ContactRound } from "../_libs/lucide-react.mjs";
import { l as profilesQuery, n as columnsQuery, o as displayName, r as contactsQuery, t as activitiesQuery } from "./crm-TMob2vJe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-D__nTsA9.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const { isAdmin } = useCrmAuth();
	const { data: contacts = [] } = useQuery(contactsQuery);
	const { data: columns = [] } = useQuery(columnsQuery);
	const { data: profiles = [] } = useQuery(profilesQuery);
	const { data: activities = [] } = useQuery(activitiesQuery);
	const assigned = contacts.filter((c) => c.assigned_to).length;
	const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
	const stats = [
		{
			label: isAdmin ? "Total contacts" : "My contacts",
			value: contacts.length,
			icon: ContactRound
		},
		...isAdmin ? [{
			label: "Team members",
			value: profiles.length,
			icon: UsersRound
		}] : [],
		{
			label: "Assigned",
			value: assigned,
			icon: UserCheck
		},
		{
			label: "Unassigned",
			value: contacts.length - assigned,
			icon: CircleDashed
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: isAdmin ? "Workspace overview across all leads." : "Overview of the leads assigned to you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel shadow-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-4 w-4 text-primary" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-3xl font-semibold tracking-tight",
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel shadow-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-tight",
						children: "Contacts per column"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: columns.map((col) => {
							const count = contacts.filter((c) => c.column_id === col.id).length;
							const pct = contacts.length ? Math.round(count / contacts.length * 100) : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: col.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: count
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-gradient-brand h-full rounded-full",
									style: { width: `${pct}%` }
								})
							})] }, col.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel shadow-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-tight",
						children: "Recent activity"
					}), activities.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "No activity yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: activities.slice(0, 12).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: displayName(a.user_id ? profileMap[a.user_id] : null)
										}),
										" ",
										a.action,
										" ",
										a.detail ? `· ${a.detail}` : ""
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: new Date(a.created_at).toLocaleString()
								})]
							})]
						}, a.id))
					})]
				})]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
