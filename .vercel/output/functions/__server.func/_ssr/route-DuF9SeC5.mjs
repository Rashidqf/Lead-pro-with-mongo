import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as FinanceSubNav } from "./FinanceShared-BUgNjM61.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DuF9SeC5.js
var import_jsx_runtime = require_jsx_runtime();
function FinanceLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Finance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Revenue, expenses, profitability, and outstanding payments."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceSubNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})
		]
	});
}
//#endregion
export { FinanceLayout as component };
