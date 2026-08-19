import { r as __exportAll } from "../_runtime.mjs";
import { a as deleteCookie$1, o as getCookie, u as setCookie$1 } from "./server-Yvyy7qRX.mjs";
import { n as __exportAll$1 } from "./server-Yvyy7qRX2.mjs";
import { n as jwtVerify, t as SignJWT } from "../_libs/jose.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session.server-DKz0L2Oo.js
var session_server_DKz0L2Oo_exports = /* @__PURE__ */ __exportAll({
	n: () => signToken,
	r: () => verifyToken,
	t: () => session_server_exports
});
var session_server_exports = /* @__PURE__ */ __exportAll$1({
	readSessionToken: () => readSessionToken,
	setSessionCookie: () => setSessionCookie,
	signToken: () => signToken,
	verifyToken: () => verifyToken
});
var COOKIE = "lf_session";
function secretKey() {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error("Missing AUTH_SECRET in .env");
	return new TextEncoder().encode(secret);
}
async function signToken(userId, email) {
	return new SignJWT({ email }).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime("30d").sign(secretKey());
}
async function verifyToken(token) {
	const { payload } = await jwtVerify(token, secretKey());
	const userId = payload.sub;
	const email = typeof payload.email === "string" ? payload.email : null;
	if (!userId || !email) throw new Error("Unauthorized");
	return {
		userId,
		email
	};
}
function readSessionToken() {
	return getCookie(COOKIE) ?? null;
}
function setSessionCookie(token) {
	if (!token) {
		deleteCookie$1(COOKIE);
		return;
	}
	setCookie$1(COOKIE, token, {
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		maxAge: 2592e3,
		secure: true
	});
}
//#endregion
export { signToken as n, verifyToken as r, session_server_DKz0L2Oo_exports as t };
