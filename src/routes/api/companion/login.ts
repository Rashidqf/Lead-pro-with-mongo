import { createFileRoute } from "@tanstack/react-router";

import { companionLogin, corsPreflight, jsonResponse } from "@/lib/companion.server";

export const Route = createFileRoute("/api/companion/login")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            email?: string;
            password?: string;
            deviceName?: string;
          };
          if (!body.email || !body.password) {
            return jsonResponse({ error: "Email and password required" }, 400);
          }
          const result = await companionLogin(body.email, body.password, body.deviceName ?? "Android");
          return jsonResponse(result);
        } catch (err) {
          return jsonResponse({ error: err instanceof Error ? err.message : "Login failed" }, 401);
        }
      },
    },
  },
});
