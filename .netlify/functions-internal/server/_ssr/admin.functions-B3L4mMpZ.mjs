import { c as createServerFn } from "./createServerFn-Dp-V928M.mjs";
import { t as createServerRpc } from "./createServerRpc-Dtu18CaZ.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CESJ7luu.mjs";
import { i as stringType, n as enumType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-B3L4mMpZ.js
async function assertAdmin(context) {
	const { data, error } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (error || !data) throw new Error("Forbidden: admin access required");
}
var adminCreateUser_createServerFn_handler = createServerRpc({
	id: "9e2c7b3651fdf5f47a11420a03b87a06f8054b52bbc825f423a1beeb88080ac9",
	name: "adminCreateUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateUser.__executeServer(opts));
var adminCreateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().min(1).max(120),
	role: enumType(["admin", "user"])
}).parse(input)).handler(adminCreateUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
		email: data.email,
		password: data.password,
		email_confirm: true,
		user_metadata: { full_name: data.fullName }
	});
	if (error || !created.user) throw new Error(error?.message ?? "Could not create user");
	await supabaseAdmin.from("profiles").update({
		full_name: data.fullName,
		email: data.email
	}).eq("id", created.user.id);
	await supabaseAdmin.from("user_roles").delete().eq("user_id", created.user.id);
	await supabaseAdmin.from("user_roles").insert({
		user_id: created.user.id,
		role: data.role
	});
	return { id: created.user.id };
});
var adminUpdateUser_createServerFn_handler = createServerRpc({
	id: "9b71e5a434778dc97380077d3f09e026ed75e736a126e93db3d54f114e7e6592",
	name: "adminUpdateUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateUser.__executeServer(opts));
var adminUpdateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	userId: stringType().uuid(),
	fullName: stringType().trim().min(1).max(120).optional(),
	role: enumType(["admin", "user"]).optional(),
	isActive: booleanType().optional(),
	password: stringType().min(8).max(72).optional()
}).parse(input)).handler(adminUpdateUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	if (data.fullName !== void 0 || data.isActive !== void 0) {
		const patch = {};
		if (data.fullName !== void 0) patch.full_name = data.fullName;
		if (data.isActive !== void 0) patch.is_active = data.isActive;
		const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
		if (error) throw new Error(error.message);
	}
	if (data.password) {
		const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
		if (error) throw new Error(error.message);
	}
	if (data.isActive === false) await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: "876000h" });
	else if (data.isActive === true) await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: "none" });
	if (data.role) {
		if (data.userId === context.userId && data.role !== "admin") throw new Error("You cannot remove your own admin access");
		await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
		await supabaseAdmin.from("user_roles").insert({
			user_id: data.userId,
			role: data.role
		});
	}
	return { ok: true };
});
var adminDeleteUser_createServerFn_handler = createServerRpc({
	id: "75454526e81445e210b3752ed6012b474b177f745b67b452ea06088e76834860",
	name: "adminDeleteUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteUser.__executeServer(opts));
var adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ userId: stringType().uuid() }).parse(input)).handler(adminDeleteUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	if (data.userId === context.userId) throw new Error("You cannot delete your own account");
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	await supabaseAdmin.from("contacts").update({ assigned_to: null }).eq("assigned_to", data.userId);
	const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { adminCreateUser_createServerFn_handler, adminDeleteUser_createServerFn_handler, adminUpdateUser_createServerFn_handler };
