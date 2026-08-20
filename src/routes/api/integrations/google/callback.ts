import { createFileRoute } from "@tanstack/react-router";
import { jwtVerify } from "jose";

export const Route = createFileRoute("/api/integrations/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const err = url.searchParams.get("error");
          if (err) return Response.redirect(`/reminders?google=${encodeURIComponent(err)}`, 302);
          if (!code || !state) return Response.redirect("/reminders?google=missing_code", 302);

          const secret = process.env.AUTH_SECRET;
          if (!secret) return Response.redirect("/reminders?google=error", 302);
          const { payload } = await jwtVerify(state, new TextEncoder().encode(secret));
          const userId = payload.sub;
          const purpose = (payload as { purpose?: string }).purpose;
          if (!userId || purpose !== "google_oauth") {
            return Response.redirect("/reminders?google=bad_state", 302);
          }

          const { getDb, col } = await import("@/integrations/mongo/client.server");
          const { exchangeGoogleCode, saveGoogleTokens } = await import(
            "@/lib/google-calendar.server"
          );
          const tokens = await exchangeGoogleCode(code);
          const db = await getDb();
          const existing = await col(db, "user_integrations").findOne({ _id: userId });
          const existingRefresh = (existing?.google as { refresh_token_enc?: string } | null)
            ?.refresh_token_enc;
          await saveGoogleTokens(db, userId, tokens, existingRefresh);
          return Response.redirect("/reminders?google=connected", 302);
        } catch (e) {
          console.error("[google-callback]", e);
          return Response.redirect("/reminders?google=error", 302);
        }
      },
    },
  },
});
