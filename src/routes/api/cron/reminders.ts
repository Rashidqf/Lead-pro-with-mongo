import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/cron/reminders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        const auth = request.headers.get("authorization") || "";
        const url = new URL(request.url);
        const q = url.searchParams.get("secret");
        const ok =
          secret &&
          (auth === `Bearer ${secret}` || q === secret);
        if (!ok) return json({ error: "Unauthorized" }, 401);
        try {
          const { processReminderNotifications } = await import("@/lib/fcm.server");
          const result = await processReminderNotifications();
          return json({ ok: true, ...result });
        } catch (err) {
          console.error("[cron/reminders]", err);
          return json({ error: err instanceof Error ? err.message : "Failed" }, 500);
        }
      },
    },
  },
});
