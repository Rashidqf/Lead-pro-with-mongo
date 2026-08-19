import { c as createServerFn } from "./createServerFn-aZmUlApV.mjs";
import { t as createServerRpc } from "./createServerRpc-6Gzy-5qc.mjs";
import { n as hash, t as compare } from "../_libs/bcryptjs.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.functions-BYZvsRbN.js
var credentials = objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(8).max(72),
	fullName: stringType().trim().max(120).optional()
});
var getMe_createServerFn_handler = createServerRpc({
	id: "05d540c91ea9147d57c434f81d698c2e3ff5d23ba136ebab060a4513339a2b8c",
	name: "getMe",
	filename: "src/lib/auth.functions.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "GET" }).handler(getMe_createServerFn_handler, async () => {
	const { readSessionToken, verifyToken } = await import("./session.server-D9Fiu8OC.mjs").then((n) => n.t).then((n) => n.t);
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const token = readSessionToken();
	if (!token) return null;
	try {
		const claims = await verifyToken(token);
		const db = await getDb();
		const profile = await col(db, "profiles").findOne({ _id: claims.userId });
		if (!profile || profile.is_active === false) return null;
		const isAdmin = (await col(db, "user_roles").find({ user_id: claims.userId }).toArray()).some((row) => row.role === "admin");
		return {
			userId: claims.userId,
			email: profile.email ?? claims.email,
			role: isAdmin ? "admin" : "user",
			isAdmin
		};
	} catch {
		return null;
	}
});
var signIn_createServerFn_handler = createServerRpc({
	id: "15946b07b54e0909aa27fa0f35669f0600b7c3f449e509501f5aec30c0ba00fd",
	name: "signIn",
	filename: "src/lib/auth.functions.ts"
}, (opts) => signIn.__executeServer(opts));
var signIn = createServerFn({ method: "POST" }).inputValidator((input) => credentials.pick({
	email: true,
	password: true
}).parse(input)).handler(signIn_createServerFn_handler, async ({ data }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const { signToken, setSessionCookie } = await import("./session.server-D9Fiu8OC.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const email = data.email.toLowerCase();
	const user = await col(db, "users").findOne({ email });
	if (!user?.passwordHash || !await compare(data.password, String(user.passwordHash))) throw new Error("Invalid email or password");
	const profile = await col(db, "profiles").findOne({ _id: user._id });
	if (profile && profile.is_active === false) throw new Error("This account is disabled");
	await setSessionCookie(await signToken(String(user._id), email));
	return {
		userId: String(user._id),
		email
	};
});
var signUp_createServerFn_handler = createServerRpc({
	id: "bbd9915d8b85c65a3b3f8e8ee5957a3dfe60390cf4d3eb0e1e0afb89dda15aea",
	name: "signUp",
	filename: "src/lib/auth.functions.ts"
}, (opts) => signUp.__executeServer(opts));
var signUp = createServerFn({ method: "POST" }).inputValidator((input) => credentials.parse(input)).handler(signUp_createServerFn_handler, async ({ data }) => {
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const { signToken, setSessionCookie } = await import("./session.server-D9Fiu8OC.mjs").then((n) => n.t).then((n) => n.t);
	const db = await getDb();
	const email = data.email.toLowerCase();
	if (await col(db, "users").findOne({ email })) throw new Error("An account with that email already exists");
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	const fullName = data.fullName?.trim() || email.split("@")[0];
	const passwordHash = await hash(data.password, 10);
	const role = await col(db, "user_roles").findOne({ role: "admin" }) ? "user" : "admin";
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
		full_name: fullName,
		is_active: true,
		created_at: now,
		updated_at: now
	});
	await col(db, "user_roles").insertOne({
		_id: crypto.randomUUID(),
		id: crypto.randomUUID(),
		user_id: id,
		role,
		created_at: now
	});
	await setSessionCookie(await signToken(id, email));
	return {
		userId: id,
		email
	};
});
var signOut_createServerFn_handler = createServerRpc({
	id: "95f2cf03275bf7421044cb43581f390444f8462eb7ceef40d1fbcdaa0f979964",
	name: "signOut",
	filename: "src/lib/auth.functions.ts"
}, (opts) => signOut.__executeServer(opts));
var signOut = createServerFn({ method: "POST" }).handler(signOut_createServerFn_handler, async () => {
	const { setSessionCookie } = await import("./session.server-D9Fiu8OC.mjs").then((n) => n.t).then((n) => n.t);
	await setSessionCookie(null);
	return { ok: true };
});
//#endregion
export { getMe_createServerFn_handler, signIn_createServerFn_handler, signOut_createServerFn_handler, signUp_createServerFn_handler };
