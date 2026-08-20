import type { ReminderType } from "@/lib/reminders";
import { defaultNotificationPrefs } from "@/lib/google-calendar.server";

type Prefs = ReturnType<typeof defaultNotificationPrefs>;

function prefAllows(type: ReminderType, prefs: Prefs) {
  switch (type) {
    case "meeting":
      return prefs.meetings;
    case "payment_followup":
      return prefs.payments;
    case "send_proposal":
    case "send_quotation":
      return prefs.proposals;
    case "call":
    case "whatsapp_followup":
    case "general_task":
    default:
      return prefs.followups;
  }
}

export function fcmAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

async function getAdminMessaging() {
  if (!fcmAdminConfigured()) return null;
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getMessaging } = await import("firebase-admin/messaging");
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getMessaging();
}

export async function sendToTokens(tokens: string[], title: string, body: string) {
  const messaging = await getAdminMessaging();
  if (!messaging || tokens.length === 0) return { success: 0, failure: 0 };
  try {
    const res = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: { fcmOptions: { link: "/reminders" } },
    });
    return { success: res.successCount, failure: res.failureCount };
  } catch (err) {
    console.error("[fcm]", err);
    return { success: 0, failure: tokens.length };
  }
}

export async function processReminderNotifications(now = new Date()) {
  const { getDb, col } = await import("@/integrations/mongo/client.server");
  const db = await getDb();
  const pending = await col(db, "reminders")
    .find({ status: "pending" })
    .limit(2000)
    .toArray();

  let dueSoon = 0;
  let overdue = 0;

  for (const doc of pending) {
    const due = new Date(doc.due_at as Date);
    const minutes = Number(doc.notify_before_minutes ?? 30);
    const assigned = String(doc.assigned_to);
    const integ = await col(db, "user_integrations").findOne({ _id: assigned });
    const prefs = {
      ...defaultNotificationPrefs(),
      ...((integ?.notification_prefs as Prefs | undefined) ?? {}),
    };
    const tokens = ((integ?.fcm_tokens as { token: string }[]) ?? []).map((t) => t.token);
    if (!tokens.length) continue;
    if (!prefAllows(doc.type as ReminderType, prefs)) continue;

    const windowStart = new Date(due.getTime() - Math.max(0, minutes) * 60_000);

    // Due-soon: now >= due - notify_before && now < due (forgiving for hourly cron)
    if (
      minutes > 0 &&
      !doc.notification_sent_at &&
      now >= windowStart &&
      now < due
    ) {
      const title = String(doc.title || "Reminder");
      await sendToTokens(tokens, "Upcoming reminder", `${title} is due soon`);
      await col(db, "reminders").updateOne(
        { _id: doc._id },
        { $set: { notification_sent_at: now } },
      );
      dueSoon += 1;
      continue;
    }

    // Overdue once
    if (prefs.overdue && !doc.overdue_notified_at && now >= due) {
      const title = String(doc.title || "Reminder");
      await sendToTokens(tokens, "Overdue reminder", `${title} is overdue`);
      await col(db, "reminders").updateOne(
        { _id: doc._id },
        { $set: { overdue_notified_at: now } },
      );
      overdue += 1;
    }
  }

  // Daily summary around 8:00 Asia/Karachi (hour check in UTC+5 ≈ 03:00 UTC)
  let summaries = 0;
  const karachiHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  if (karachiHour === 8) {
    const users = await col(db, "user_integrations").find({}).limit(500).toArray();
    for (const u of users) {
      const prefs = {
        ...defaultNotificationPrefs(),
        ...((u.notification_prefs as Prefs | undefined) ?? {}),
      };
      if (!prefs.daily_summary) continue;
      const tokens = ((u.fcm_tokens as { token: string }[]) ?? []).map((t) => t.token);
      if (!tokens.length) continue;
      const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(now);
      if (u.daily_summary_sent_on === dayKey) continue;
      const mine = await col(db, "reminders")
        .find({ assigned_to: String(u._id), status: "pending" })
        .toArray();
      const overdueCount = mine.filter((r) => new Date(r.due_at as Date) < now).length;
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      const dueToday = mine.filter((r) => {
        const d = new Date(r.due_at as Date);
        return d >= now && d <= todayEnd;
      }).length;
      if (overdueCount + dueToday === 0) {
        await col(db, "user_integrations").updateOne(
          { _id: u._id },
          { $set: { daily_summary_sent_on: dayKey } },
        );
        continue;
      }
      await sendToTokens(
        tokens,
        "Daily reminders",
        `${overdueCount} overdue · ${dueToday} due today`,
      );
      await col(db, "user_integrations").updateOne(
        { _id: u._id },
        { $set: { daily_summary_sent_on: dayKey } },
      );
      summaries += 1;
    }
  }

  return { dueSoon, overdue, summaries };
}
