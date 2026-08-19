import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as setCookie$1, n as getCookie, t as deleteCookie$1 } from "./request-response-DOhekycA.mjs";
import { n as jwtVerify, t as SignJWT } from "../_libs/jose.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session.server-D9Fiu8OC.js
var session_server_D9Fiu8OC_exports = /* @__PURE__ */ __exportAll({
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
		maxAge: 3600 * 24 * 30,
		secure: true
	});
}
//#endregion
export { signToken as n, verifyToken as r, session_server_D9Fiu8OC_exports as t };
