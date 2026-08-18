import { c as createServerFn } from "./createServerFn-Dp-V928M.mjs";
import { t as createServerRpc } from "./createServerRpc-Dtu18CaZ.mjs";
import { i as stringType, r as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.functions-DdEtKbBs.js
var publicSignUp_createServerFn_handler = createServerRpc({
	id: "00249a9b9f6bbc8b62362dcbdac6089a13292adfe36597823af1aa390138865a",
	name: "publicSignUp",
	filename: "src/lib/auth.functions.ts"
}, (opts) => publicSignUp.__executeServer(opts));
var publicSignUp = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().max(120).optional()
}).parse(input)).handler(publicSignUp_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	const fullName = data.fullName?.trim() || data.email.split("@")[0];
	const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
		email: data.email,
		password: data.password,
		email_confirm: true,
		user_metadata: { full_name: fullName }
	});
	if (error || !created.user) throw new Error(error?.message ?? "Could not create account");
	return { id: created.user.id };
});
//#endregion
export { publicSignUp_createServerFn_handler };
