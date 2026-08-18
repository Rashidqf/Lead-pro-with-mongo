import { createServerFn } from "@tanstack/react-start";
import { hash, compare } from "bcryptjs";
import { z } from "zod";

const credentials = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().max(120).optional(),
});

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const { readSessionToken, verifyToken } = await import("@/integrations/mongo/session.server");
  const { getDb, col } = await import("@/integrations/mongo/client.server");
  const token = readSessionToken();
  if (!token) return null;
  try {
    const claims = await verifyToken(token);
    const db = await getDb();
    const profile = await col(db,"profiles").findOne({ _id: claims.userId });
    if (!profile || profile.is_active === false) return null;
    const roles = await col(db,"user_roles").find({ user_id: claims.userId }).toArray();
    const isAdmin = roles.some((row) => row.role === "admin");
    return {
      userId: claims.userId,
      email: (profile.email as string | null) ?? claims.email,
      role: (isAdmin ? "admin" : "user") as "admin" | "user",
      isAdmin,
    };
  } catch {
    return null;
  }
});

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.pick({ email: true, password: true }).parse(input))
  .handler(async ({ data }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const { signToken, setSessionCookie } = await import("@/integrations/mongo/session.server");
    const db = await getDb();
    const email = data.email.toLowerCase();
    const user = await col(db,"users").findOne({ email });
    if (!user?.passwordHash || !(await compare(data.password, String(user.passwordHash)))) {
      throw new Error("Invalid email or password");
    }
    const profile = await col(db,"profiles").findOne({ _id: user._id });
    if (profile && profile.is_active === false) throw new Error("This account is disabled");
    const token = await signToken(String(user._id), email);
    await setSessionCookie(token);
    return { userId: String(user._id), email };
  });

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.parse(input))
  .handler(async ({ data }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const { signToken, setSessionCookie } = await import("@/integrations/mongo/session.server");
    const db = await getDb();
    const email = data.email.toLowerCase();
    const existing = await col(db,"users").findOne({ email });
    if (existing) throw new Error("An account with that email already exists");

    const id = crypto.randomUUID();
    const now = new Date();
    const fullName = data.fullName?.trim() || email.split("@")[0];
    const passwordHash = await hash(data.password, 10);
    const adminExists = await col(db,"user_roles").findOne({ role: "admin" });
    const role = adminExists ? "user" : "admin";

    await col(db,"users").insertOne({ _id: id, email, passwordHash, created_at: now });
    await col(db,"profiles").insertOne({
      _id: id,
      id,
      email,
      full_name: fullName,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    await col(db,"user_roles").insertOne({
      _id: crypto.randomUUID(),
      id: crypto.randomUUID(),
      user_id: id,
      role,
      created_at: now,
    });

    const token = await signToken(id, email);
    await setSessionCookie(token);
    return { userId: id, email };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { setSessionCookie } = await import("@/integrations/mongo/session.server");
  await setSessionCookie(null);
  return { ok: true };
});
