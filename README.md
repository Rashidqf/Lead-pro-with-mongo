# LeadPilot CRM

LeadPilot is a simple CRM for managing leads, customers, projects, and money — from first contact to payment.

## What it does

- **Leads & contacts** — Import WhatsApp/CSV contacts, assign them to your team, and track every lead.
- **Pipeline board** — Drag-and-drop Kanban: move deals from lead → closed.
- **Projects** — Link customer work to a value, status, and payment balance.
- **Finance** — Record income and expenses, see outstanding balances, and view analytics by period.
- **Team roles** — Admins manage everything; users only see contacts assigned to them.
- **Call from phone** — Optional Android companion dials a lead on your SIM when you tap Call in the CRM.

## Main pages

| Page | Purpose |
| --- | --- |
| Dashboard | Overview of contacts, assignments, and activity |
| Board | Kanban pipeline |
| Contacts | Search, import CSV, assign, edit |
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

1. Push the repo to GitHub and import it on [vercel.com/new](https://vercel.com/new).
2. Set env vars: `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`.
3. In MongoDB Atlas, allow network access for Vercel (`0.0.0.0/0` is fine for a first deploy).

## Android companion (optional)

Folder: `android-companion/`

Install on an Android phone, sign in with the same CRM account, and leave it listening. In the CRM, **Call from phone** places the call on that phone’s SIM. If the companion is offline, Call opens the normal dialer instead.

## Notes

- Phone numbers are stored without spaces and must be unique.
- Finance “All time” is the default analytics period; lists paginate at 20 rows with search and filters.
