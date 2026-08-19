import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { f as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as ShieldCheck, l as SquareKanban, n as Users } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CDgfTv6q.js
var import_jsx_runtime = require_jsx_runtime();
var features = [
	{
		icon: SquareKanban,
		title: "Trello-style pipeline",
		body: "Drag leads across Leads, Contacted, Follow Up, Interested and Closed. Every move saves instantly."
	},
	{
		icon: Users,
		title: "Assign to your team",
		body: "Search any teammate and hand off a card. They see it immediately — nobody else does."
	},
	{
		icon: ShieldCheck,
		title: "Role-based access",
		body: "Admins manage everything. Users only ever see the contacts assigned to them."
	}
];
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground",
					children: "LP"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold tracking-tight",
					children: "LeadPilot"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					children: "Sign in"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-6 pb-24 pt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground",
						children: "CRM · Lead management · Kanban"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-4xl font-semibold leading-tight tracking-tight sm:text-5xl",
						children: "Every lead, in the right column, with the right owner."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-lg text-muted-foreground",
						children: "Import your contact list, drag cards through your pipeline, and give each teammate exactly the leads they should see — nothing more."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: "Open your workspace"
							})
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-20 grid gap-4 sm:grid-cols-3",
				children: features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-panel shadow-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-5 w-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-base font-semibold tracking-tight",
							children: f.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: f.body
						})
					]
				}, f.title))
			})]
		})]
	});
}
//#endregion
export { Index as component };
