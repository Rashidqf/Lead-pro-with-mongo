import { createFileRoute } from "@tanstack/react-router";

import { authCompanion, claimNextCall, corsPreflight, jsonResponse } from "@/lib/companion.server";

export const Route = createFileRoute("/api/companion/next-call")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async ({ request }) => {
        try {
          const user = await authCompanion(request);
          const url = new URL(request.url);
          const deviceId = url.searchParams.get("deviceId") ?? undefined;
          const job = await claimNextCall(user.userId, deviceId);
          return jsonResponse({ job });
        } catch (err) {
          return jsonResponse({ error: err instanceof Error ? err.message : "Unauthorized" }, 401);
        }
      },
    },
  },
});
