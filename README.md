# LeadPilot CRM

LeadPilot is a simple CRM for managing leads, customers, projects, and money — from first contact to payment.

## What it does

- **Leads & contacts** — Import WhatsApp/CSV contacts, assign them to your team, and track every lead.
- **Pipeline board** — Drag-and-drop Kanban: move deals from lead → closed.
- **Projects** — Link customer work to a value, status, and payment balance.
- **Finance** — Record income and expenses, see outstanding balances, and view analytics by period.
- **Reminders** — Schedule the next call, meeting, or follow-up; optional Google Calendar + browser notifications.
- **Team roles** — Admins manage everything; users only see contacts assigned to them.
- **Call from phone** — Optional Android companion dials a lead on your SIM when you tap Call in the CRM.

## Main pages

| Page | Purpose |
| --- | --- |
| Dashboard | Overview, overdue / due today / upcoming reminders |
| Reminders | Full reminder list, Google Calendar + push prefs |
| Board | Kanban pipeline |
| Contacts | Search, import CSV, assign, edit, schedule next action |
| Projects | Project list with status and outstanding filters |
| Finance | Overview, transactions, income, expenses, outstanding |
| Team | Create users, set roles (admin only) |

## Who it’s for

Small teams that get leads (for example from WhatsApp), assign follow-ups, run projects for customers, and need a clear view of what was paid and what is still owed.

## Tech stack

- React + TypeScript
- TanStack Start (router + server functions)
- MongoDB
- Tailwind CSS
- Deployable on Vercel

## Quick start

```sh
npm install
npm run dev
```

Create a `.env` file:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=lead-flow-pro
AUTH_SECRET=your-long-random-secret
```

Open the app, sign up (first user becomes admin), then import contacts or create projects.

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run locally |
| `npm run build` | Production build |
| `npm run import:mongo` | Load a previous Mongo dump |
| `npm run import:contacts -- file.csv` | Import contacts from CSV (skips existing phones) |

## Deploy (Vercel)

Yes — this app is ready for Vercel (TanStack Start + Nitro `vercel` preset).

1. Push your latest code to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new) (Framework Preset: **TanStack Start**).
3. Set these **Environment Variables** (Production + Preview):

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Yes | Atlas connection string (`@` in password → `%40`) |
| `MONGODB_DB` | Yes | e.g. `lead-flow-pro` |
| `AUTH_SECRET` | Yes | Long random string |
| `APP_URL` | Recommended | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `CRON_SECRET` | Recommended | Protects hourly `/api/cron/reminders` |

Optional later: `GOOGLE_*`, `VITE_FIREBASE_*`, `FIREBASE_*`, `TOKEN_ENCRYPTION_KEY`.

4. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (or Vercel’s IPs).
5. Deploy. After deploy, set `APP_URL` / `GOOGLE_REDIRECT_URI` to the real HTTPS URL if you use Google Calendar.

Hourly reminder cron is already in `vercel.json`.

## Android companion (optional)

Folder: `android-companion/`

Install on an Android phone, sign in with the same CRM account, and leave it listening. In the CRM, **Call from phone** places the call on that phone’s SIM. If the companion is offline, Call opens the normal dialer instead.

## Notes

- Phone numbers are stored without spaces and must be unique.
- Finance “All time” is the default analytics period; lists paginate at 20 rows with search and filters.
