import { decryptSecret, encryptSecret } from "@/lib/token-crypto.server";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const CAL_API = "https://www.googleapis.com/calendar/v3";
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"].join(" ");

export type GoogleIntegration = {
  refresh_token_enc: string;
  access_token_enc?: string;
  access_token_expires_at?: Date;
  email?: string;
  connected_at: Date;
};

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000"}/api/integrations/google/callback`
  );
}

export function buildGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH}?${params}`;
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token?: string;
  };
}

async function fetchGoogleEmail(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { email?: string };
  return json.email;
}

export async function saveGoogleTokens(
  db: import("mongodb").Db,
  userId: string,
  tokens: { access_token: string; refresh_token?: string; expires_in: number },
  existingRefreshEnc?: string | null,
) {
  const { col } = await import("@/integrations/mongo/client.server");
  const refreshEnc =
    tokens.refresh_token != null
      ? encryptSecret(tokens.refresh_token)
      : existingRefreshEnc ?? null;
  if (!refreshEnc) throw new Error("Google did not return a refresh token");

  const email = await fetchGoogleEmail(tokens.access_token);
  const google: GoogleIntegration = {
    refresh_token_enc: refreshEnc,
    access_token_enc: encryptSecret(tokens.access_token),
    access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    email,
    connected_at: new Date(),
  };
  await col(db, "user_integrations").updateOne(
    { _id: userId },
    {
      $set: { google, updated_at: new Date() },
      $setOnInsert: {
        _id: userId,
        fcm_tokens: [],
        notification_prefs: defaultNotificationPrefs(),
        timezone: "Asia/Karachi",
        created_at: new Date(),
      },
    },
    { upsert: true },
  );
  return google;
}

export function defaultNotificationPrefs() {
  return {
    meetings: true,
    followups: true,
    payments: true,
    proposals: true,
    overdue: true,
    daily_summary: true,
  };
}

async function getAccessToken(db: import("mongodb").Db, userId: string): Promise<string | null> {
  if (!googleConfigured()) return null;
  const { col } = await import("@/integrations/mongo/client.server");
  const row = await col(db, "user_integrations").findOne({ _id: userId });
  const google = row?.google as GoogleIntegration | null | undefined;
  if (!google?.refresh_token_enc) return null;

  const expires = google.access_token_expires_at
    ? new Date(google.access_token_expires_at).getTime()
    : 0;
  if (google.access_token_enc && expires > Date.now() + 60_000) {
    try {
      return decryptSecret(google.access_token_enc);
    } catch {
      /* refresh */
    }
  }

  const refresh = decryptSecret(google.refresh_token_enc);
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token: string; expires_in: number };
  await col(db, "user_integrations").updateOne(
    { _id: userId },
    {
      $set: {
        "google.access_token_enc": encryptSecret(json.access_token),
        "google.access_token_expires_at": new Date(Date.now() + json.expires_in * 1000),
        updated_at: new Date(),
      },
    },
  );
  return json.access_token;
}

function eventBody(reminder: Record<string, unknown>, contactName?: string) {
  const due = new Date(reminder.due_at as Date | string);
  const end = new Date(due.getTime() + 30 * 60_000);
  const title = String(reminder.title || "Reminder");
  const summary = contactName ? `${title} — ${contactName}` : title;
  return {
    summary,
    description: [reminder.notes, `CRM reminder ${reminder.id || reminder._id}`]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: due.toISOString() },
    end: { dateTime: end.toISOString() },
  };
}

/** Best-effort Calendar sync. Never throws to callers — returns reminder with optional google ids. */
export async function syncReminderCalendar(
  action: "create" | "update" | "cancel" | "delete",
  userId: string,
  reminder: Record<string, unknown>,
  addToCalendar?: boolean,
): Promise<Record<string, unknown>> {
  try {
    const { getDb, col } = await import("@/integrations/mongo/client.server");
    const db = await getDb();
    const token = await getAccessToken(db, userId);
    if (!token) return reminder;

    const calendarId = String(reminder.google_calendar_id || "primary");
    const eventId = reminder.google_event_id ? String(reminder.google_event_id) : null;

    if (action === "cancel" || action === "delete") {
      if (!eventId) return { ...reminder, google_event_id: null, google_calendar_id: null };
      await fetch(`${CAL_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      const cleared = { ...reminder, google_event_id: null, google_calendar_id: null };
      if (reminder._id || reminder.id) {
        await col(db, "reminders").updateOne(
          { _id: String(reminder._id ?? reminder.id) },
          { $set: { google_event_id: null, google_calendar_id: null } },
        );
      }
      return cleared;
    }

    // complete: leave event alone (caller must not call with cancel)
    if (action === "create" && !addToCalendar) return reminder;

    let contactName: string | undefined;
    if (reminder.contact_id) {
      const c = await col(db, "contacts").findOne({ _id: String(reminder.contact_id) });
      contactName = c ? String(c.name) : undefined;
    }
    const body = eventBody(reminder, contactName);

    if (action === "update" && eventId) {
      const res = await fetch(
        `${CAL_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) return reminder;
      return reminder;
    }

    if (action === "update" && !eventId && !addToCalendar) return reminder;

    if (addToCalendar || action === "create") {
      const res = await fetch(`${CAL_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return reminder;
      const json = (await res.json()) as { id?: string };
      if (!json.id) return reminder;
      const next = {
        ...reminder,
        google_event_id: json.id,
        google_calendar_id: calendarId,
      };
      if (reminder._id || reminder.id) {
        await col(db, "reminders").updateOne(
          { _id: String(reminder._id ?? reminder.id) },
          { $set: { google_event_id: json.id, google_calendar_id: calendarId } },
        );
      }
      return next;
    }
  } catch (err) {
    console.error("[google-calendar]", err);
  }
  return reminder;
}

export async function disconnectGoogle(db: import("mongodb").Db, userId: string) {
  const { col } = await import("@/integrations/mongo/client.server");
  await col(db, "user_integrations").updateOne(
    { _id: userId },
    { $set: { google: null, updated_at: new Date() } },
  );
}
