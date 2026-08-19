import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-aZmUlApV.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BsBAu1JQ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-crm-auth-CgWrhDrj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
//#endregion
export { signUp as a, signOut as i, getMe as n, useCrmAuth as o, signIn as r, AuthProvider as t };
