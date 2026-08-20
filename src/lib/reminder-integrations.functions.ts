import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAuth } from "@/integrations/mongo/auth-middleware";
import { defaultNotificationPrefs } from "@/lib/google-calendar.server";

export type NotificationPrefs = {
  meetings: boolean;
  followups: boolean;
  payments: boolean;
  proposals: boolean;
  overdue: boolean;
  daily_summary: boolean;
};

export type ReminderIntegrations = {
  googleConnected: boolean;
  googleEmail?: string | null;
  fcmRegistered: boolean;
  notification_prefs: NotificationPrefs;
  timezone: string;
  googleConfigured: boolean;
  fcmConfigured: boolean;
};

export const getReminderIntegrations = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<ReminderIntegrations> => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const { googleConfigured } = await import("@/lib/google-calendar.server");
    const db = await getDb();
    const row = await col(db, "user_integrations").findOne({ _id: context.userId });
    const google = row?.google as { email?: string } | null | undefined;
    const tokens = (row?.fcm_tokens as unknown[]) ?? [];
    return {
      googleConnected: Boolean(google),
      googleEmail: google?.email ?? null,
      fcmRegistered: tokens.length > 0,
      notification_prefs: {
        ...defaultNotificationPrefs(),
        ...((row?.notification_prefs as NotificationPrefs | undefined) ?? {}),
      },
      timezone: String(row?.timezone ?? "Asia/Karachi"),
      googleConfigured: googleConfigured(),
      fcmConfigured: Boolean(
        process.env.VITE_FIREBASE_API_KEY &&
          process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_CLIENT_EMAIL &&
          process.env.FIREBASE_PRIVATE_KEY,
      ),
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

export const updateNotificationPrefs = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        meetings: z.boolean(),
        followups: z.boolean(),
        payments: z.boolean(),
        proposals: z.boolean(),
        overdue: z.boolean(),
        daily_summary: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    await col(db, "user_integrations").updateOne(
      { _id: context.userId },
      {
        $set: { notification_prefs: data, updated_at: new Date() },
        $setOnInsert: {
          _id: context.userId,
          google: null,
          fcm_tokens: [],
          timezone: "Asia/Karachi",
          created_at: new Date(),
        },
      },
      { upsert: true },
    );
    return data;
  });

export const registerFcmToken = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(10), user_agent: z.string().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const now = new Date();
    const existing = await col(db, "user_integrations").findOne({ _id: context.userId });
    const tokens = (
      (existing?.fcm_tokens as { token: string; updated_at?: Date; user_agent?: string }[]) ?? []
    ).filter((t) => t.token !== data.token);
    tokens.push({ token: data.token, updated_at: now, user_agent: data.user_agent });
    await col(db, "user_integrations").updateOne(
      { _id: context.userId },
      {
        $set: {
          fcm_tokens: tokens.slice(-5),
          updated_at: now,
        },
        $setOnInsert: {
          _id: context.userId,
          google: null,
          notification_prefs: defaultNotificationPrefs(),
          timezone: "Asia/Karachi",
          created_at: now,
        },
      },
      { upsert: true },
    );
    return { ok: true };
  });
