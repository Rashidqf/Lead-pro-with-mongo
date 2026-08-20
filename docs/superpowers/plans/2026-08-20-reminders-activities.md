# Reminders / Activities Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Ship CRM reminders (source of truth) with dashboard/contact/project UX; then optional per-user Google Calendar and browser FCM.

**Architecture:** New `reminders` collection + server fns. Google/FCM are best-effort side effects. Existing `activities` stays an audit log.

**Tech Stack:** TanStack Start server fns, MongoDB, React, date-fns, Vercel Cron (later), googleapis + firebase-admin (later phases).

## Global Constraints

- Do not rebuild contacts, board, finance, or auth.
- CRM create/complete/cancel never blocked by Google or FCM.
- Google refresh tokens server-only, encrypted.
- Status: `pending | completed | cancelled`; overdue = pending + due_at < now.
- Complete leaves Calendar event; cancel/delete removes it.
- Due-soon: `now >= due_at - notify_before_minutes && now < due_at` + idempotent `notification_sent_at`.
- v1 create UI: What / When / Notify / Calendar — keep simple.

---

### Task 1: Types + server CRUD

**Files:**
- Create: `src/lib/reminders.ts`
- Create: `src/lib/reminders.functions.ts`
- Modify: `src/integrations/mongo/client.server.ts` (indexes)

- [x] Types, labels, suggested due helpers, paginate/buckets
- [x] `listReminders`, `listReminderBuckets`, `createReminder`, `updateReminder`, `completeReminder`, `cancelReminder`, `deleteReminder`
- [x] Indexes on connect

### Task 2: ReminderDialog + list UI

**Files:**
- Create: `src/components/reminders/ReminderDialog.tsx`
- Create: `src/components/reminders/ReminderList.tsx`
- Create: `src/components/reminders/NextActionBar.tsx`

- [x] Minimal create/edit dialog + quick type chips
- [x] Complete → Schedule next prompt

### Task 3: Pages + AppShell

**Files:**
- Create: `src/routes/_authenticated/reminders.tsx`
- Modify: `src/components/crm/AppShell.tsx`
- Modify: `src/routes/_authenticated/dashboard.tsx`
- Modify: `src/components/crm/ContactDialog.tsx`
- Modify: `src/components/finance/ProjectDialog.tsx` (and/or projects page)

- [x] `/reminders` with search/filters/pagination
- [x] Dashboard Overdue / Due Today / Upcoming
- [x] Contact + project Next Action

### Task 4: Google Calendar OAuth + sync

**Files:**
- Create: `src/lib/google-calendar.server.ts`
- Create: `src/routes/api/integrations/google/start.ts`
- Create: `src/routes/api/integrations/google/callback.ts`
- Modify: reminder create/update/cancel/delete to sync best-effort
- Update: `.env.example`

- [x] OAuth start/callback + encrypted tokens
- [x] Best-effort sync (complete leaves Calendar event)

### Task 5: FCM + prefs + cron

**Files:**
- Create: `src/lib/fcm.server.ts`, client register helper
- Create: `src/routes/api/cron/reminders.ts`
- Modify: `vercel.json` crons
- Prefs UI on reminders page

- [x] FCM register + prefs UI
- [x] Hourly cron with forgiving due-soon window + idempotency

---

**Execution:** Inline in this session, Phase 1 (Tasks 1–3) first so the CRM is usable without Google/Firebase keys.
