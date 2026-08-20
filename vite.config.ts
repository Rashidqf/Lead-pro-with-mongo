// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: process.env.VERCEL ? "vercel" : "node-server" },
  vite: {
    ssr: {
      // Keep heavy CJS SDKs out of the SSR graph — reduces Rolldown circular
      // runtime-helper chunks (__exportAll is not a function on preview).
      external: [
        "firebase-admin",
        "firebase-admin/app",
        "firebase-admin/messaging",
        "firebase",
        "firebase/app",
        "firebase/messaging",
      ],
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
