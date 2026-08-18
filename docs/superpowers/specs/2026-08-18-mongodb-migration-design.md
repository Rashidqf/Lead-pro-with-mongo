# MongoDB migration design

Replace Supabase (Auth + PostgREST + RLS) with local MongoDB and TanStack Start server functions.

## Decisions

- Host: local MongoDB (`mongodb://127.0.0.1:27017`, db `lead-flow-pro`)
- Auth: email/password in a `users` collection, httpOnly JWT cookie
- Data: keep the five dumped collections (`profiles`, `user_roles`, `board_columns`, `contacts`, `activities`) plus `users`
- Access: all reads/writes go through server functions; browser never talks to Mongo
- Rules (same as previous RLS): admin sees all contacts; users see assigned contacts only; only admin creates/deletes contacts and manages team
- First signup becomes admin if no admin exists
- Import `mongo-export/` into local Mongo, then hash passwords for the two existing users

## Out of scope

- MongoDB Atlas / Netlify production Mongo
- Realtime subscriptions
