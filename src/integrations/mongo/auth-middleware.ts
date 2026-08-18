import { createMiddleware } from "@tanstack/react-start";

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { readSessionToken, verifyToken } = await import("./session.server");
  const { getDb, col } = await import("./client.server");
  const token = readSessionToken();
  if (!token) throw new Error("Unauthorized");

  let claims: { userId: string; email: string };
  try {
    claims = await verifyToken(token);
  } catch {
    throw new Error("Unauthorized");
  }

  const db = await getDb();
  const profile = await col(db,"profiles").findOne({ _id: claims.userId });
  if (!profile || profile.is_active === false) throw new Error("Unauthorized");

  const roles = await col(db, "user_roles").find({ user_id: claims.userId }).toArray();
  const isAdmin = roles.some((row) => row.role === "admin");

  return next({
    context: {
      userId: claims.userId,
      email: (profile.email as string | null) ?? claims.email,
      isAdmin,
      role: (isAdmin ? "admin" : "user") as "admin" | "user",
    },
  });
});
