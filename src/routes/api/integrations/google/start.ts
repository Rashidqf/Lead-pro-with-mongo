import { createFileRoute } from "@tanstack/react-router";
import { SignJWT } from "jose";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/integrations/google/start")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { readSessionToken, verifyToken } = await import(
            "@/integrations/mongo/session.server"
          );
          const { googleConfigured, buildGoogleAuthUrl } = await import(
            "@/lib/google-calendar.server"
          );
          if (!googleConfigured()) {
            return Response.redirect("/reminders?google=not_configured", 302);
          }
          const token = readSessionToken();
          if (!token) return Response.redirect("/auth", 302);
          const { userId } = await verifyToken(token);
          const secret = process.env.AUTH_SECRET;
          if (!secret) return json({ error: "Missing AUTH_SECRET" }, 500);
          const state = await new SignJWT({ purpose: "google_oauth" })
            .setProtectedHeader({ alg: "HS256" })
            .setSubject(userId)
            .setExpirationTime("15m")
            .sign(new TextEncoder().encode(secret));
          return Response.redirect(buildGoogleAuthUrl(state), 302);
        } catch (err) {
          console.error(err);
          return Response.redirect("/reminders?google=error", 302);
        }
      },
    },
  },
});
