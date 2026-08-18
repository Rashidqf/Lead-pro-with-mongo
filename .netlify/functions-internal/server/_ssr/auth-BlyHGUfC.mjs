import { r as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-Dp-V928M.mjs";
import { i as stringType, r as objectType } from "../_libs/zod.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { p as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-4K9aSq_X.mjs";
import { t as supabase } from "./client-BzZDn2SK.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { n as Label, t as Input } from "./label-CwWTNQoo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BlyHGUfC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var publicSignUp = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().max(120).optional()
}).parse(input)).handler(createSsrRpc("00249a9b9f6bbc8b62362dcbdac6089a13292adfe36597823af1aa390138865a"));
var schema = objectType({
	email: stringType().trim().email("Enter a valid email").max(255),
	password: stringType().min(8, "Password must be at least 8 characters").max(72)
});
function AuthPage() {
	const navigate = useNavigate();
	const signUpFn = useServerFn(publicSignUp);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({
				to: "/dashboard",
				replace: true
			});
		});
	}, [navigate]);
	async function signIn(e) {
		e.preventDefault();
		const parsed = schema.safeParse({
			email,
			password
		});
		if (!parsed.success) return toast.error(parsed.error.errors[0].message);
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword(parsed.data);
		setLoading(false);
		if (error) return toast.error(error.message);
		navigate({
			to: "/dashboard",
			replace: true
		});
	}
	async function signUp(e) {
		e.preventDefault();
		const parsed = schema.safeParse({
			email,
			password
		});
		if (!parsed.success) return toast.error(parsed.error.errors[0].message);
		setLoading(true);
		try {
			await signUpFn({ data: {
				...parsed.data,
				fullName: fullName.trim() || void 0
			} });
			const { error } = await supabase.auth.signInWithPassword(parsed.data);
			if (error) throw error;
			toast.success("Account created.");
			navigate({
				to: "/dashboard",
				replace: true
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not create account");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-gradient-brand mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground",
						children: "LP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "LeadPilot CRM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Pipeline, contacts and team management in one board."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel shadow-card p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "signin",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "mb-5 grid w-full grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signin",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								children: "Create account"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "space-y-4",
								onSubmit: signIn,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "email",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "email",
										type: "email",
										autoComplete: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password",
										type: "password",
										autoComplete: "current-password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full",
										disabled: loading,
										children: loading ? "Signing in…" : "Sign in"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signup",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "space-y-4",
								onSubmit: signUp,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "name",
										children: "Full name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "name",
										value: fullName,
										onChange: (e) => setFullName(e.target.value),
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "email-up",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "email-up",
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password-up",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password-up",
										type: "password",
										autoComplete: "new-password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full",
										disabled: loading,
										children: loading ? "Creating…" : "Create account"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-xs text-muted-foreground",
										children: "The first account created becomes the workspace admin."
									})
								]
							})
						})
					]
				})
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
