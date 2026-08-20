import {
  disconnectGoogleCalendar,
  getReminderIntegrations,
  registerFcmToken,
  updateNotificationPrefs,
  type ReminderIntegrations,
} from "@/lib/reminder-integrations.functions";

export type { ReminderIntegrations, NotificationPrefs } from "@/lib/reminder-integrations.functions";

export const reminderIntegrationsQuery = {
  queryKey: ["reminder-integrations"] as const,
  queryFn: (): Promise<ReminderIntegrations> => getReminderIntegrations(),
};

export {
  disconnectGoogleCalendar,
  getReminderIntegrations,
  registerFcmToken,
  updateNotificationPrefs,
};
