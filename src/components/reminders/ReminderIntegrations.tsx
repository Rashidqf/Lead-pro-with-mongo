import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  disconnectGoogleCalendar,
  reminderIntegrationsQuery,
} from "@/lib/reminder-integrations";

export function ReminderIntegrations() {
  const queryClient = useQueryClient();
  const { data } = useQuery(reminderIntegrationsQuery);

  const disconnect = useMutation({
    mutationFn: () => disconnectGoogleCalendar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-integrations"] });
      toast.success("Google Calendar disconnected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">Google Calendar</p>
          <p className="text-xs text-muted-foreground">
            {data?.googleConnected
              ? `Connected${data.googleEmail ? ` · ${data.googleEmail}` : ""}`
              : data?.googleConfigured === false
                ? "Add GOOGLE_CLIENT_ID / SECRET to enable Connect"
                : "Not connected — meetings can still be saved in the CRM"}
          </p>
        </div>
        <div className="flex gap-2">
          {data?.googleConnected ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
            >
              Disconnect
            </Button>
          ) : data?.googleConfigured === false ? (
            <Button type="button" size="sm" variant="outline" disabled>
              Connect Google
            </Button>
          ) : (
            <Button type="button" size="sm" asChild>
              <a href="/api/integrations/google/start">Connect Google</a>
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Due reminders show on the Dashboard and Reminders page. Scheduled push alerts need a paid
        scheduler later — not available on Vercel Hobby.
      </p>
    </div>
  );
}
