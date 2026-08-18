import { createServerFn } from "@tanstack/react-start";
import { hash } from "bcryptjs";
import { z } from "zod";

import { requireAuth } from "@/integrations/mongo/auth-middleware";

async function assertAdmin(context: { isAdmin: boolean }) {
  if (!context.isAdmin) throw new Error("Forbidden: admin access required");
}

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        password: z.string().min(8).max(72),
        fullName: z.string().trim().min(1).max(120),
        role: z.enum(["admin", "user"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const email = data.email.toLowerCase();
    const exists = await col(db,"users").findOne({ email });
    if (exists) throw new Error("An account with that email already exists");

    const id = crypto.randomUUID();
    const now = new Date();
    const passwordHash = await hash(data.password, 10);
    await col(db,"users").insertOne({ _id: id, email, passwordHash, created_at: now });
    await col(db,"profiles").insertOne({
      _id: id,
      id,
      email,
      full_name: data.fullName,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    await col(db,"user_roles").insertOne({
      _id: crypto.randomUUID(),
      id: crypto.randomUUID(),
      user_id: id,
      role: data.role,
      created_at: now,
    });
    return { id };
  });

export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        fullName: z.string().trim().min(1).max(120).optional(),
        role: z.enum(["admin", "user"]).optional(),
        isActive: z.boolean().optional(),
        password: z.string().min(8).max(72).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();

    if (data.fullName !== undefined || data.isActive !== undefined) {
      const patch: Record<string, unknown> = { updated_at: new Date() };
      if (data.fullName !== undefined) patch.full_name = data.fullName;
      if (data.isActive !== undefined) patch.is_active = data.isActive;
      await col(db,"profiles").updateOne({ _id: data.userId }, { $set: patch });
    }

    if (data.password) {
      await col(db, "users").updateOne(
        { _id: data.userId },
        { $set: { passwordHash: await hash(data.password, 10) } },
      );
    }

    if (data.role) {
      if (data.userId === context.userId && data.role !== "admin") {
        throw new Error("You cannot remove your own admin access");
      }
      await col(db,"user_roles").deleteMany({ user_id: data.userId });
      await col(db,"user_roles").insertOne({
        _id: crypto.randomUUID(),
        id: crypto.randomUUID(),
        user_id: data.userId,
        role: data.role,
        created_at: new Date(),
      });
    }

    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    await col(db,"contacts").updateMany({ assigned_to: data.userId }, { $set: { assigned_to: null } });
    await col(db,"users").deleteOne({ _id: data.userId });
    await col(db,"profiles").deleteOne({ _id: data.userId });
    await col(db,"user_roles").deleteMany({ user_id: data.userId });
    return { ok: true };
  });
