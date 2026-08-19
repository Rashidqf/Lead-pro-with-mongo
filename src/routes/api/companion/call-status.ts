import { createFileRoute } from "@tanstack/react-router";

import { authCompanion, corsPreflight, jsonResponse, updateCallJob } from "@/lib/companion.server";

export const Route = createFileRoute("/api/companion/call-status")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      POST: async ({ request }) => {
        try {
          const user = await authCompanion(request);
          const body = (await request.json()) as { jobId?: string; status?: string; detail?: string };
          if (!body.jobId || !body.status) return jsonResponse({ error: "jobId and status required" }, 400);
          await updateCallJob(user.userId, body.jobId, body.status, body.detail);
          return jsonResponse({ ok: true });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          const status = message === "Unauthorized" ? 401 : 400;
          return jsonResponse({ error: message }, status);
        }
      },
    },
  },
});
