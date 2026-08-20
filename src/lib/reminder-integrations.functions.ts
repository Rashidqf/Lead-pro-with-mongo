import { createServerFn } from "@tanstack/react-start";

import { requireAuth } from "@/integrations/mongo/auth-middleware";

export type ReminderIntegrations = {
  googleConnected: boolean;
  googleEmail?: string | null;
  googleConfigured: boolean;
};

export const getReminderIntegrations = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<ReminderIntegrations> => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const { googleConfigured } = await import("@/lib/google-calendar.server");
    const db = await getDb();
    const row = await col(db, "user_integrations").findOne({ _id: context.userId });
    const google = row?.google as { email?: string } | null | undefined;
    return {
      googleConnected: Boolean(google),
      googleEmail: google?.email ?? null,
      googleConfigured: googleConfigured(),
    };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { getDb } = await import("@/integrations/mongo/client.server");
    const { disconnectGoogle } = await import("@/lib/google-calendar.server");
    const db = await getDb();
    await disconnectGoogle(db, context.userId);
    return { ok: true };
  });
