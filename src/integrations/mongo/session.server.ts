import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "lf_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET in .env");
  return new TextEncoder().encode(secret);
}

export async function signToken(userId: string, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey());
  const userId = payload.sub;
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!userId || !email) throw new Error("Unauthorized");
  return { userId, email };
}

export function readSessionToken() {
  return getCookie(COOKIE) ?? null;
}

export function setSessionCookie(token: string | null) {
  if (!token) {
    deleteCookie(COOKIE);
    return;
  }
  setCookie(COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}
