import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as supabase } from "./client-BzZDn2SK.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-crm-auth-dBRK3oH3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)({
	session: null,
	userId: null,
	email: null,
	role: null,
	isAdmin: false,
	loading: true
});
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
			setSession(next);
			if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") queryClient.invalidateQueries();
		});
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, [queryClient]);
	const userId = session?.user.id ?? null;
	const { data: role, isLoading: roleLoading } = useQuery({
		queryKey: ["my-role", userId],
		enabled: !!userId,
		queryFn: async () => {
			const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
			if (error) throw error;
			return data?.some((r) => r.role === "admin") ? "admin" : "user";
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			session,
			userId,
			email: session?.user.email ?? null,
			role: role ?? null,
			isAdmin: role === "admin",
			loading: loading || !!userId && roleLoading
		},
		children
	});
}
var useCrmAuth = () => (0, import_react.useContext)(AuthContext);
//#endregion
export { useCrmAuth as n, AuthProvider as t };
