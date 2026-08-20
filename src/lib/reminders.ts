import { addDays, addHours, endOfDay, format, isAfter, isBefore, setHours, setMinutes, startOfDay } from "date-fns";

export type ReminderType =
  | "meeting"
  | "call"
  | "send_proposal"
  | "send_quotation"
  | "whatsapp_followup"
  | "payment_followup"
  | "general_task";

export type ReminderStatus = "pending" | "completed" | "cancelled";

export type ReminderSource = "dashboard" | "contact" | "project" | "manual" | "automation";

export type Reminder = {
  id: string;
  type: ReminderType;
  title: string;
  contact_id: string;
  contact_name?: string | null;
  project_id: string | null;
  project_name?: string | null;
  assigned_to: string;
  due_at: string;
  notes: string | null;
  status: ReminderStatus;
  source: ReminderSource;
  notify_before_minutes: number;
  google_event_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
};

export type ReminderBuckets = {
  overdue: Reminder[];
  dueToday: Reminder[];
  upcoming: Reminder[];
};

export const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "send_proposal", label: "Send Proposal" },
  { value: "send_quotation", label: "Send Quotation" },
  { value: "whatsapp_followup", label: "WhatsApp Follow-up" },
  { value: "payment_followup", label: "Payment Follow-up" },
  { value: "general_task", label: "Other" },
];

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = Object.fromEntries(
  REMINDER_TYPES.map((t) => [t.value, t.label]),
) as Record<ReminderType, string>;

export function calendarDefaultOn(type: ReminderType) {
  return type === "meeting";
}

export function suggestedDueAt(type: ReminderType, now = new Date()): Date {
  const eleven = (d: Date) => setMinutes(setHours(d, 11), 0);
  const afterHours = now.getHours() >= 18;

  switch (type) {
    case "call":
      if (afterHours) return eleven(addDays(now, 1));
      return addHours(now, 1);
    case "payment_followup":
      return eleven(addDays(now, 3));
    case "meeting":
    case "send_proposal":
    case "send_quotation":
    case "whatsapp_followup":
    case "general_task":
    default:
      return eleven(addDays(now, afterHours || now.getHours() >= 11 ? 1 : 0));
  }
}

export function formatReminderWhen(iso: string) {
  return format(new Date(iso), "d MMM yyyy · h:mm a");
}

export function reminderBucket(r: Reminder, now = new Date()): "overdue" | "today" | "upcoming" | "other" {
  if (r.status !== "pending") return "other";
  const due = new Date(r.due_at);
  if (isBefore(due, now)) return "overdue";
  if (!isBefore(due, startOfDay(now)) && !isAfter(due, endOfDay(now))) return "today";
  if (isBefore(due, addDays(endOfDay(now), 7))) return "upcoming";
  return "other";
}

export const PAGE_SIZE = 20;

export const remindersQuery = {
  queryKey: ["reminders"] as const,
  queryFn: async (): Promise<Reminder[]> => {
    const { listReminders } = await import("@/lib/reminders.functions");
    return listReminders();
  },
};

export const reminderBucketsQuery = {
  queryKey: ["reminder-buckets"] as const,
  queryFn: async (): Promise<ReminderBuckets> => {
    const { listReminderBuckets } = await import("@/lib/reminders.functions");
    return listReminderBuckets();
  },
};

export {
  cancelReminder,
  completeReminder,
  createReminder,
  deleteReminder,
  listReminderBuckets,
  listReminders,
  updateReminder,
} from "@/lib/reminders.functions";
