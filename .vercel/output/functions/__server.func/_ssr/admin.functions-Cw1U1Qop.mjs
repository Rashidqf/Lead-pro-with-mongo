import { i as createServerFn } from "./server-Yvyy7qRX.mjs";
import { t as createServerRpc } from "./createServerRpc-ChGssE9S.mjs";
import { t as requireAuth } from "./auth-middleware-a5hCx0S0.mjs";
import { n as hash } from "../_libs/bcryptjs.mjs";
import { a as objectType, n as booleanType, o as stringType, r as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-Cw1U1Qop.js
async function assertAdmin(context) {
	if (!context.isAdmin) throw new Error("Forbidden: admin access required");
}
var adminCreateUser_createServerFn_handler = createServerRpc({
	id: "9e2c7b3651fdf5f47a11420a03b87a06f8054b52bbc825f423a1beeb88080ac9",
	name: "adminCreateUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateUser.__executeServer(opts));
var adminCreateUser = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().min(1).max(120),
	role: enumType(["admin", "user"])
}).parse(input)).handler(adminCreateUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const email = data.email.toLowerCase();
	if (await col(db, "users").findOne({ email })) throw new Error("An account with that email already exists");
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	const passwordHash = await hash(data.password, 10);
	await col(db, "users").insertOne({
		_id: id,
		email,
		passwordHash,
		created_at: now
	});
	await col(db, "profiles").insertOne({
		_id: id,
		id,
		email,
		full_name: data.fullName,
		is_active: true,
		created_at: now,
		updated_at: now
	});
	await col(db, "user_roles").insertOne({
		_id: crypto.randomUUID(),
		id: crypto.randomUUID(),
		user_id: id,
		role: data.role,
		created_at: now
	});
	return { id };
});
var adminUpdateUser_createServerFn_handler = createServerRpc({
	id: "9b71e5a434778dc97380077d3f09e026ed75e736a126e93db3d54f114e7e6592",
	name: "adminUpdateUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateUser.__executeServer(opts));
var adminUpdateUser = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	userId: stringType().uuid(),
	fullName: stringType().trim().min(1).max(120).optional(),
	role: enumType(["admin", "user"]).optional(),
	isActive: booleanType().optional(),
	password: stringType().min(8).max(72).optional()
}).parse(input)).handler(adminUpdateUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	if (data.fullName !== void 0 || data.isActive !== void 0) {
		const patch = { updated_at: /* @__PURE__ */ new Date() };
		if (data.fullName !== void 0) patch.full_name = data.fullName;
		if (data.isActive !== void 0) patch.is_active = data.isActive;
		await col(db, "profiles").updateOne({ _id: data.userId }, { $set: patch });
	}
	if (data.password) await col(db, "users").updateOne({ _id: data.userId }, { $set: { passwordHash: await hash(data.password, 10) } });
	if (data.role) {
		if (data.userId === context.userId && data.role !== "admin") throw new Error("You cannot remove your own admin access");
		await col(db, "user_roles").deleteMany({ user_id: data.userId });
		await col(db, "user_roles").insertOne({
			_id: crypto.randomUUID(),
			id: crypto.randomUUID(),
			user_id: data.userId,
			role: data.role,
			created_at: /* @__PURE__ */ new Date()
		});
	}
	return { ok: true };
});
var adminDeleteUser_createServerFn_handler = createServerRpc({
	id: "75454526e81445e210b3752ed6012b474b177f745b67b452ea06088e76834860",
	name: "adminDeleteUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteUser.__executeServer(opts));
var adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ userId: stringType().uuid() }).parse(input)).handler(adminDeleteUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	if (data.userId === context.userId) throw new Error("You cannot delete your own account");
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	await col(db, "contacts").updateMany({ assigned_to: data.userId }, { $set: { assigned_to: null } });
	await col(db, "users").deleteOne({ _id: data.userId });
	await col(db, "profiles").deleteOne({ _id: data.userId });
	await col(db, "user_roles").deleteMany({ user_id: data.userId });
	return { ok: true };
});
//#endregion
export { adminCreateUser_createServerFn_handler, adminDeleteUser_createServerFn_handler, adminUpdateUser_createServerFn_handler };
