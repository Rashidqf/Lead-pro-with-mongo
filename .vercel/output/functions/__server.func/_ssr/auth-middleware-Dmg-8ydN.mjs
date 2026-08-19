import { t as createMiddleware } from "./createMiddleware-C9N8CCZm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-middleware-Dmg-8ydN.js
var requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const { readSessionToken, verifyToken } = await import("./session.server-D9Fiu8OC.mjs").then((n) => n.t).then((n) => n.t);
	const { getDb, col } = await import("./client.server-COnOrad6.mjs").then((n) => n.t).then((n) => n.t);
	const token = readSessionToken();
	if (!token) throw new Error("Unauthorized");
	let claims;
	try {
		claims = await verifyToken(token);
	} catch {
		throw new Error("Unauthorized");
	}
	const db = await getDb();
	const profile = await col(db, "profiles").findOne({ _id: claims.userId });
	if (!profile || profile.is_active === false) throw new Error("Unauthorized");
	const isAdmin = (await col(db, "user_roles").find({ user_id: claims.userId }).toArray()).some((row) => row.role === "admin");
	return next({ context: {
		userId: claims.userId,
		email: profile.email ?? claims.email,
		isAdmin,
		role: isAdmin ? "admin" : "user"
	} });
});
//#endregion
export { requireAuth as t };
