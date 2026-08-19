# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).


```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy on Vercel

This is a TanStack Start app with Nitro. Import the GitHub repo at [vercel.com/new](https://vercel.com/new) (framework preset: **TanStack Start**).

Set these environment variables for Production, Preview, and Development:

| Name | Example |
| --- | --- |
| `MONGODB_URI` | Atlas SRV URI (encode `@` in the password as `%40`) |
| `MONGODB_DB` | `lead-flow-pro` |
| `AUTH_SECRET` | long random string (same as local `.env`) |

In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Vercel functions can connect.

Then deploy. Each push to the connected branch updates the site.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
