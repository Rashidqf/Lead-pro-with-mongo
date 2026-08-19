import { o as __toESM } from "../_runtime.mjs";
import { i as createServerFn } from "./server-Yvyy7qRX.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { R as redirect, _ as createRootRouteWithContext, b as useRouter, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as __exportAll } from "./server-Yvyy7qRX2.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { a as jsonResponse, i as corsPreflight, n as claimNextCall, r as companionLogin, s as updateCallJob, t as authCompanion } from "./companion.server-1Pv96LAS.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B95rxBNs.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as useQueryClient, r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CL8vSWs-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DRjN60hR.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
var ThemeContext = (0, import_react.createContext)({
	theme: "dark",
	toggle: () => {}
});
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem("crm-theme");
		if (stored) setTheme(stored);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		window.localStorage.setItem("crm-theme", theme);
	}, [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			toggle: () => setTheme((t) => t === "dark" ? "light" : "dark")
		},
		children
	});
}
var useTheme = () => (0, import_react.useContext)(ThemeContext);
var credentials = objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().max(120).optional()
});
var getMe = createServerFn({ method: "GET" }).handler(createSsrRpc("05d540c91ea9147d57c434f81d698c2e3ff5d23ba136ebab060a4513339a2b8c"));
var signIn = createServerFn({ method: "POST" }).inputValidator((input) => credentials.pick({
	email: true,
	password: true
}).parse(input)).handler(createSsrRpc("15946b07b54e0909aa27fa0f35669f0600b7c3f449e509501f5aec30c0ba00fd"));
var signUp = createServerFn({ method: "POST" }).inputValidator((input) => credentials.parse(input)).handler(createSsrRpc("bbd9915d8b85c65a3b3f8e8ee5957a3dfe60390cf4d3eb0e1e0afb89dda15aea"));
var signOut = createServerFn({ method: "POST" }).handler(createSsrRpc("95f2cf03275bf7421044cb43581f390444f8462eb7ceef40d1fbcdaa0f979964"));
var AuthContext = (0, import_react.createContext)({
	session: null,
	userId: null,
	email: null,
	role: null,
	isAdmin: false,
	loading: true,
	refresh: async () => {}
});
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const queryClient = useQueryClient();
	async function refresh() {
		const me = await getMe();
		setSession(me);
		await queryClient.invalidateQueries();
	}
	(0, import_react.useEffect)(() => {
		getMe().then(setSession).finally(() => setLoading(false));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			session,
			userId: session?.userId ?? null,
			email: session?.email ?? null,
			role: session?.role ?? null,
			isAdmin: session?.isAdmin ?? false,
			loading,
			refresh
		},
		children
	});
}
var useCrmAuth = () => (0, import_react.useContext)(AuthContext);
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$18 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "LeadPilot — Lead & Contact Pipeline CRM" },
			{
				name: "description",
				content: "Kanban CRM for lead management: import contacts, assign them to teammates and track deals."
			},
			{
				property: "og:title",
				content: "LeadPilot — Lead & Contact Pipeline CRM"
			},
			{
				property: "og:description",
				content: "Kanban CRM for importing, assigning and tracking leads across your team."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$18.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-right",
			richColors: true
		})] }) })
	});
}
var $$splitComponentImporter$13 = () => import("./routes-CDgfTv6q.mjs");
var Route$17 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "LeadPilot — Lead & Contact Pipeline CRM" },
		{
			name: "description",
			content: "LeadPilot is a Kanban CRM for lead management: import contacts, assign them to your team, and track every deal from lead to closed."
		},
		{
			property: "og:title",
			content: "LeadPilot — Lead & Contact Pipeline CRM"
		},
		{
			property: "og:description",
			content: "A Kanban CRM for importing, assigning and tracking leads across your team."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./route-LVGuHSdu.mjs");
var Route$16 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const me = await getMe();
		if (!me) throw redirect({ to: "/auth" });
		return { user: me };
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./auth-8TjVWrse.mjs");
var Route$15 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — LeadPilot CRM" },
		{
			name: "description",
			content: "Sign in to LeadPilot to manage leads, contacts and your team pipeline."
		},
		{
			property: "og:title",
			content: "Sign in — LeadPilot CRM"
		},
		{
			property: "og:description",
			content: "Sign in to LeadPilot to manage leads and your team pipeline."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var BASE_URL = "";
var Route$14 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...[{
			path: "/",
			changefreq: "weekly",
			priority: "1.0"
		}, {
			path: "/auth",
			changefreq: "monthly",
			priority: "0.5"
		}].map((e) => [
			`  <url>`,
			`    <loc>${BASE_URL}${e.path}</loc>`,
			e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
			e.priority ? `    <priority>${e.priority}</priority>` : null,
			`  </url>`
		].filter(Boolean).join("\n")),
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$10 = () => import("./board-BGAlE6Hm.mjs");
var Route$13 = createFileRoute("/_authenticated/board")({
	head: () => ({ meta: [
		{ title: "Pipeline board — LeadPilot CRM" },
		{
			name: "description",
			content: "Drag and drop leads through your sales pipeline columns."
		},
		{
			property: "og:title",
			content: "Pipeline board — LeadPilot CRM"
		},
		{
			property: "og:description",
			content: "Drag and drop leads through your sales pipeline."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./contacts-Br6pjHBA.mjs");
var Route$12 = createFileRoute("/_authenticated/contacts")({
	head: () => ({ meta: [
		{ title: "Contacts — LeadPilot CRM" },
		{
			name: "description",
			content: "Search, filter, import and assign every contact in your CRM."
		},
		{
			property: "og:title",
			content: "Contacts — LeadPilot CRM"
		},
		{
			property: "og:description",
			content: "Search, filter, import and assign your CRM contacts."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./dashboard-D__nTsA9.mjs");
var Route$11 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard — LeadPilot CRM" },
		{
			name: "description",
			content: "Pipeline overview: contacts, assignments and recent team activity."
		},
		{
			property: "og:title",
			content: "Dashboard — LeadPilot CRM"
		},
		{
			property: "og:description",
			content: "Pipeline overview: contacts, assignments and activity."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./route-C0qd4cJ3.mjs");
var Route$10 = createFileRoute("/_authenticated/finance")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./projects-DXK0BNng.mjs");
var Route$9 = createFileRoute("/_authenticated/projects")({
	head: () => ({ meta: [{ title: "Projects — LeadPilot CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./users-Br3bobGQ.mjs");
var Route$8 = createFileRoute("/_authenticated/users")({
	head: () => ({ meta: [
		{ title: "Team management — LeadPilot CRM" },
		{
			name: "description",
			content: "Create teammates, set roles, reset passwords and control access."
		},
		{
			property: "og:title",
			content: "Team management — LeadPilot CRM"
		},
		{
			property: "og:description",
			content: "Create teammates, set roles and control access."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./finance-B2PhU6Ee.mjs");
var Route$7 = createFileRoute("/_authenticated/finance/")({
	head: () => ({ meta: [{ title: "Finance Overview — LeadPilot CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./expenses-j8AqAXI-.mjs");
var Route$6 = createFileRoute("/_authenticated/finance/expenses")({
	head: () => ({ meta: [{ title: "Expenses — LeadPilot CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./income-C-31mvPm.mjs");
var Route$5 = createFileRoute("/_authenticated/finance/income")({
	head: () => ({ meta: [{ title: "Income — LeadPilot CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./outstanding-BITdDeEf.mjs");
var Route$4 = createFileRoute("/_authenticated/finance/outstanding")({
	head: () => ({ meta: [{ title: "Outstanding — LeadPilot CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./transactions-CzvUNAoE.mjs");
var Route$3 = createFileRoute("/_authenticated/finance/transactions")({
	head: () => ({ meta: [{ title: "Transactions — LeadPilot CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$2 = createFileRoute("/api/companion/call-status")({ server: { handlers: {
	OPTIONS: async () => corsPreflight(),
	POST: async ({ request }) => {
		try {
			const user = await authCompanion(request);
			const body = await request.json();
			if (!body.jobId || !body.status) return jsonResponse({ error: "jobId and status required" }, 400);
			await updateCallJob(user.userId, body.jobId, body.status, body.detail);
			return jsonResponse({ ok: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed";
			return jsonResponse({ error: message }, message === "Unauthorized" ? 401 : 400);
		}
	}
} } });
var Route$1 = createFileRoute("/api/companion/login")({ server: { handlers: {
	OPTIONS: async () => corsPreflight(),
	POST: async ({ request }) => {
		try {
			const body = await request.json();
			if (!body.email || !body.password) return jsonResponse({ error: "Email and password required" }, 400);
			const result = await companionLogin(body.email, body.password, body.deviceName ?? "Android");
			return jsonResponse(result);
		} catch (err) {
			return jsonResponse({ error: err instanceof Error ? err.message : "Login failed" }, 401);
		}
	}
} } });
var Route = createFileRoute("/api/companion/next-call")({ server: { handlers: {
	OPTIONS: async () => corsPreflight(),
	GET: async ({ request }) => {
		try {
			const user = await authCompanion(request);
			const deviceId = new URL(request.url).searchParams.get("deviceId") ?? void 0;
			const job = await claimNextCall(user.userId, deviceId);
			return jsonResponse({ job });
		} catch (err) {
			return jsonResponse({ error: err instanceof Error ? err.message : "Unauthorized" }, 401);
		}
	}
} } });
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var AuthenticatedRouteRoute = Route$16.update({
	id: "/_authenticated",
	getParentRoute: () => Route$18
});
var AuthRoute = Route$15.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$18
});
var SitemapDotxmlRoute = Route$14.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$18
});
var AuthenticatedBoardRoute = Route$13.update({
	id: "/board",
	path: "/board",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedContactsRoute = Route$12.update({
	id: "/contacts",
	path: "/contacts",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$11.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFinanceRouteRoute = Route$10.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProjectsRoute = Route$9.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedUsersRoute = Route$8.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFinanceIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedFinanceRouteRoute
});
var AuthenticatedFinanceExpensesRoute = Route$6.update({
	id: "/expenses",
	path: "/expenses",
	getParentRoute: () => AuthenticatedFinanceRouteRoute
});
var AuthenticatedFinanceIncomeRoute = Route$5.update({
	id: "/income",
	path: "/income",
	getParentRoute: () => AuthenticatedFinanceRouteRoute
});
var AuthenticatedFinanceOutstandingRoute = Route$4.update({
	id: "/outstanding",
	path: "/outstanding",
	getParentRoute: () => AuthenticatedFinanceRouteRoute
});
var AuthenticatedFinanceTransactionsRoute = Route$3.update({
	id: "/transactions",
	path: "/transactions",
	getParentRoute: () => AuthenticatedFinanceRouteRoute
});
var ApiCompanionCallStatusRoute = Route$2.update({
	id: "/api/companion/call-status",
	path: "/api/companion/call-status",
	getParentRoute: () => Route$18
});
var ApiCompanionLoginRoute = Route$1.update({
	id: "/api/companion/login",
	path: "/api/companion/login",
	getParentRoute: () => Route$18
});
var ApiCompanionNextCallRoute = Route.update({
	id: "/api/companion/next-call",
	path: "/api/companion/next-call",
	getParentRoute: () => Route$18
});
var AuthenticatedFinanceRouteRouteChildren = {
	AuthenticatedFinanceExpensesRoute,
	AuthenticatedFinanceIncomeRoute,
	AuthenticatedFinanceOutstandingRoute,
	AuthenticatedFinanceTransactionsRoute,
	AuthenticatedFinanceIndexRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedFinanceRouteRoute: AuthenticatedFinanceRouteRoute._addFileChildren(AuthenticatedFinanceRouteRouteChildren),
	AuthenticatedBoardRoute,
	AuthenticatedContactsRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedProjectsRoute,
	AuthenticatedUsersRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	SitemapDotxmlRoute,
	ApiCompanionCallStatusRoute,
	ApiCompanionLoginRoute,
	ApiCompanionNextCallRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { signOut as a, signIn as i, useCrmAuth as n, signUp as o, getMe as r, useTheme as s, router_exports as t };
