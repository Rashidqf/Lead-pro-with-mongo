# Reminders / Activities System — Design Spec

**Date:** 2026-08-20  
**Status:** Approved for implementation (2026-08-20)  
**Product:** LeadPilot CRM

## Summary

Add a **Reminders / Activities** system so the CRM acts as an agency assistant: schedule the next action for a lead/customer, see overdue/today/upcoming work clearly, and optionally sync meetings to **Google Calendar** and alert via **Firebase Cloud Messaging** (browser). The CRM (MongoDB) is always the source of truth. Google and Firebase are best-effort integrations and must never block creating, updating, or completing a reminder.

## Decisions locked

| Topic | Choice |
| --- | --- |
| Data store | New `reminders` collection (not the existing audit `activities` log) |
| Google Calendar | Per-user OAuth (each user connects their own Google account) |
| Firebase | Browser push in v1; Android companion push later |
| Architecture | Approach 1: CRM-first + optional Calendar + FCM |
| Due-soon default | 30 minutes before (`notify_before_minutes`, default `30`) |
| Calendar default | ON for Meeting; OFF for other types (user can toggle) |

## Non-goals (v1)

- Android companion FCM (follow-up)
- Shared/workspace Google Calendar / service account
- Making Google Calendar or Firebase mandatory
- Rebuilding contacts, board, finance, or auth
- Complex recurrence (recurring reminders)
- Full notification preference UI for custom “15 min / 1 hour / 1 day” beyond storing `notify_before_minutes` with default 30 (UI can expose later)

---

## Data model

### Collection: `reminders`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` / `id` | string (UUID) | Same pattern as contacts |
| `type` | enum | See types below |
| `title` | string | Defaults from type label; user can edit |
| `contact_id` | string | Required |
| `project_id` | string \| null | Optional |
| `assigned_to` | string | User id; default current user |
| `due_at` | Date (ISO) | Date + time |
| `notes` | string \| null | Free text |
| `status` | `pending` \| `completed` \| `cancelled` | Overdue is derived: `pending` && `due_at` &lt; now |
| `source` | enum | `dashboard` \| `contact` \| `project` \| `manual` \| `automation` (default `manual`) |
| `notify_before_minutes` | number | Default `30` (not exposed as complex UI in v1) |
| `notification_sent_at` | Date \| null | Due-soon push sent (idempotency) |
| `overdue_notified_at` | Date \| null | Overdue push sent (idempotency) |
| `google_event_id` | string \| null | Calendar event id if synced |
| `google_calendar_id` | string \| null | Usually `primary` |
| `created_by` | string | User id |
| `created_at` | Date | |
| `updated_at` | Date | |
| `completed_at` | Date \| null | |
| `cancelled_at` | Date \| null | |

### Reminder types

| `type` | Label | Default Calendar toggle |
| --- | --- | --- |
| `meeting` | Meeting | ON |
| `call` | Call | OFF |
| `send_proposal` | Send Proposal | OFF |
| `send_quotation` | Send Quotation | OFF |
| `whatsapp_followup` | WhatsApp Follow-up | OFF |
| `payment_followup` | Payment Follow-up | OFF |
| `general_task` | General Task / Other | OFF |

### Collection / profile fields: Google + FCM + preferences

Store on `profiles` (or a dedicated `user_integrations` doc keyed by `user_id` — prefer **`user_integrations`** to avoid bloating profiles):

```text
user_integrations
  _id: userId
  google: {
    refresh_token_enc: string   // server-only, never sent to client
    access_token_enc?: string
    access_token_expires_at?: Date
    email?: string
    connected_at: Date
  } | null
  fcm_tokens: [{ token: string, updated_at: Date, user_agent?: string }]
  notification_prefs: {
    meetings: boolean          // default true
    followups: boolean         // WhatsApp + general_task
    payments: boolean          // payment_followup
    proposals: boolean         // send_proposal + send_quotation
    overdue: boolean           // default true
    daily_summary: boolean     // default true
  }
  timezone: string             // default "Asia/Karachi"
```

**Security:** Google refresh tokens are encrypted at rest (env `TOKEN_ENCRYPTION_KEY` or derived from `AUTH_SECRET`), written only in server functions, never returned in API/client payloads. Client only sees `{ googleConnected: boolean, googleEmail?: string }`.

### Indexes (on connect)

- `reminders`: `{ assigned_to: 1, status: 1, due_at: 1 }`
- `reminders`: `{ contact_id: 1, status: 1, due_at: 1 }`
- `reminders`: `{ project_id: 1, status: 1 }`
- `reminders`: `{ status: 1, due_at: 1, notification_sent_at: 1 }` (cron due-soon)
- `user_integrations`: `_id` = userId

---

## Status & lists

| Bucket | Rule |
| --- | --- |
| Overdue | `status === pending` && `due_at` &lt; start of today (or &lt; now — **use &lt; now** for timed accuracy) |
| Due today | `pending` && `due_at` within local calendar day |
| Upcoming | `pending` && `due_at` after end of today, within next 7 days (dashboard); full page may show all future |
| Completed | `status === completed` |
| Cancelled | `status === cancelled` (not overdue; excluded from active buckets) |

Visibility: same as contacts — admin sees all; non-admin sees reminders where `assigned_to === userId` or contact is assigned to them (match existing contact ACL).

---

## UI

### Dashboard

- Sections: **Overdue**, **Due Today**, **Upcoming** (color cues: red / amber / blue).
- Button: **+ Add Next Activity**.
- Each row: type, title, customer, time, assignee; actions Complete / Open.

### Contact dialog

- **Next Action** block with **+ Schedule**.
- Quick chips: Call, Send Proposal, WhatsApp, Meeting, Payment Follow-up, Other.
- List pending reminders for that contact.
- Prefill: customer, assignee = me, project if only one active project or last used; type from chip; suggested time by type.

### Project page / Project dialog

- Project-related pending reminders + **Schedule Next**.
- Prefill: contact + project + assignee.

### `/reminders` page (AppShell nav)

- Search (title, notes, customer name/phone).
- Filters: type, assignee, status (`all` \| pending \| overdue \| completed \| cancelled).
- Pagination: 20 per page (reuse finance list patterns).
- Connect Google / notification prefs / enable browser push entry points here (or a slim Settings strip on this page).

### Create / edit dialog

Keep v1 UX minimal: **What? → When? → Notify / Calendar toggles → Save**.

Do **not** expose technical settings (custom notify-before options, source, encryption, etc.) in the main dialog.

Visible fields:

- Type (chips) — What?
- Due date + time — When? (title defaults from type; optional notes)
- Customer (required; locked when opened from contact)
- Project (optional; locked/prefilled from project context)
- Assignee (default current user; can hide for solo use later)
- Notes (optional, collapsed or short)
- Toggle: **Notify me** (default ON; still saves if FCM unavailable)
- Toggle: **Add to Google Calendar** (disabled + “Connect Google” if not connected; default ON only for Meeting)

`notify_before_minutes` stays server default `30` without a complex picker in v1.

### Complete → Schedule next

On Complete:

1. Mark reminder completed; best-effort Calendar update.
2. Toast success + prompt **Schedule next?**
3. If yes, open create dialog with same contact/project/assignee; type empty or last type; suggested due time.

---

## Suggested times (defaults)

| Type | Suggested due |
| --- | --- |
| Meeting | Tomorrow 11:00 (or next free hour if “today”) |
| Call | Today + 1 hour (or tomorrow 11:00 if after hours) |
| Send Proposal / Quotation | Tomorrow 11:00 |
| WhatsApp Follow-up | Tomorrow 11:00 |
| Payment Follow-up | In 3 days, 11:00 |
| General / Other | Tomorrow 11:00 |

(After-hours = after 18:00 local.)

---

## Google Calendar (per-user OAuth)

### Connect flow

1. User clicks **Connect Google Calendar**.
2. Server starts OAuth 2.0 (scopes: Calendar events create/update/delete only — e.g. `calendar.events`).
3. Callback exchanges code for tokens; encrypt and store refresh token server-side.
4. Client sees connected state only.

### Sync rules

| CRM action | Calendar |
| --- | --- |
| Create + Calendar ON + connected | Create event; store `google_event_id` |
| Create + Calendar OFF or not connected | No Calendar call |
| Update title/time/notes | Patch event if `google_event_id` |
| **Complete** | **Leave Calendar event as-is** (history of meetings that happened). CRM status becomes `completed` only. |
| **Cancel** | Best-effort cancel/delete Calendar event |
| **Delete** | Best-effort delete Calendar event |
| Disconnect Google | Clear tokens; keep CRM reminders; clear ability to sync new; leave old `google_event_id` as historical |

Failures: log; CRM operation succeeds; optional toast “Saved in CRM; Calendar sync failed.”

### Env vars (server)

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (e.g. `https://<app>/api/integrations/google/callback`)
- Encryption key for tokens (or document use of `AUTH_SECRET`)

---

## Firebase Cloud Messaging (browser v1)

### Client

- Firebase web config via env (`VITE_FIREBASE_*` public keys only).
- Request permission; register FCM token; POST to server to upsert into `fcm_tokens`.
- Service worker shows notification; click → deep link `/reminders?id=…` or `/contacts` with contact selected if feasible.

### When to send

| Event | Condition | Idempotency |
| --- | --- | --- |
| Due soon | `pending`, `now >= due_at - notify_before_minutes` AND `now < due_at`, prefs allow type, `notification_sent_at` is null | Set `notification_sent_at` **after successful send**; on failure leave null to retry. Hourly cron is OK: the window lasts until `due_at`, so a run at any time inside `[due−30m, due)` still sends once. |
| Overdue | `pending`, `due_at < now`, prefs.overdue | Set `overdue_notified_at` after successful send (once per reminder unless reopened — completed reminders don’t re-notify) |
| Daily summary | Prefs.daily_summary; once per local morning | Store `last_daily_summary_at` on `user_integrations` (date key) |

No duplicate sends: cron must skip rows with tracking fields already set.

### Preferences mapping

| Pref | Types |
| --- | --- |
| meetings | `meeting` |
| followups | `whatsapp_followup`, `general_task`, `call` |
| payments | `payment_followup` |
| proposals | `send_proposal`, `send_quotation` |
| overdue | overdue sweeps |
| daily_summary | morning digest |

### Scheduler

- Vercel Cron → secured route `POST /api/cron/reminders` with `CRON_SECRET` header.
- Frequency: **hourly** for due-soon + overdue; daily summary window e.g. 08:00–09:00 Asia/Karachi (or user timezone).
- Logic must be **idempotent** under double invocation.

---

## Server functions / routes (sketch)

Reuse `requireAuth`, Mongo `col`, TanStack server fns / route handlers.

- `listReminders`, `listReminderBuckets` (dashboard)
- `createReminder`, `updateReminder`, `completeReminder`, `deleteReminder`
- `getNotificationPrefs`, `updateNotificationPrefs`
- `registerFcmToken`, `unregisterFcmToken`
- `getGoogleStatus`, OAuth start + callback routes
- `disconnectGoogle`
- Cron route for notifications

Existing `activities` audit log may optionally receive `reminder_created` / `reminder_completed` for the feed — nice-to-have, not required for v1.

---

## Deep links

Notification payload data:

- `reminderId`
- `contactId`
- `url` e.g. `/reminders?open=<reminderId>`

App reads query and opens edit/complete dialog.

---

## Testing checklist (manual)

1. Create reminder without Google → saves; no Calendar.
2. Connect Google → Meeting with Calendar ON → event appears; id stored.
3. Disconnect Google → CRM reminders intact; new Calendar sync off.
4. Complete → Schedule next prefills contact.
5. Cron twice → one due-soon notification only.
6. Prefs off for proposals → no push for proposal type.
7. Non-admin only sees own/assigned reminders.
8. Dashboard buckets match overdue / today / upcoming.

---

## Implementation order (for later plan)

1. Schema + CRUD + `/reminders` + dashboard buckets + contact/project quick actions (no Google/FCM yet).
2. Complete → Schedule next UX.
3. Google OAuth + Calendar sync.
4. FCM token registration + prefs UI.
5. Vercel cron + idempotent due-soon / overdue / daily summary.

---

## Out of scope follow-ups

- Android companion push
- Custom notify-before UI (15m / 1h / 1d)
- Recurring reminders
- Two-way sync (Calendar → CRM)

---

## Spec self-review

- No TBD placeholders left for v1 behavior.
- CRM-first vs integrations consistent throughout.
- Single feature area suitable for one implementation plan with phased order above.
- Overdue definition explicit (`due_at < now`).
- Token secrecy and idempotency explicit.
