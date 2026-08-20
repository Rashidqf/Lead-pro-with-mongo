import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  disconnectGoogleCalendar,
  reminderIntegrationsQuery,
  updateNotificationPrefs,
} from "@/lib/reminder-integrations";
import { registerBrowserPush } from "@/lib/fcm.client";

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

  const enablePush = useMutation({
    mutationFn: () => registerBrowserPush(),
    onSuccess: (ok) => {
      if (ok) toast.success("Browser notifications enabled");
      else toast.message("Push not configured — set Firebase env vars to enable");
      queryClient.invalidateQueries({ queryKey: ["reminder-integrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const prefs = data?.notification_prefs;

  async function togglePref(key: keyof NonNullable<typeof prefs>, value: boolean) {
    if (!prefs) return;
    try {
      await updateNotificationPrefs({ data: { ...prefs, [key]: value } });
      queryClient.invalidateQueries({ queryKey: ["reminder-integrations"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save prefs");
    }
  }

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">Browser notifications</p>
          <p className="text-xs text-muted-foreground">
            {data?.fcmRegistered
              ? "This browser is registered for due-soon and overdue alerts"
              : "Optional Firebase push for due-soon / overdue"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => enablePush.mutate()}
          disabled={enablePush.isPending}
        >
          {data?.fcmRegistered ? "Re-enable" : "Enable"}
        </Button>
      </div>

      {prefs && (
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["meetings", "Meetings"],
              ["followups", "Follow-ups"],
              ["payments", "Payments"],
              ["proposals", "Proposals"],
              ["overdue", "Overdue alerts"],
              ["daily_summary", "Daily summary"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) => togglePref(key, e.target.checked)}
              />
              <Label className="text-xs font-normal">{label}</Label>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
