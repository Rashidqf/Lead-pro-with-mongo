import { ReminderRow } from "@/components/reminders/ReminderRow";
import type { Reminder } from "@/lib/reminders";

export function ReminderList({
  reminders,
  empty = "No reminders.",
  onEdit,
  onScheduleNext,
  compact,
}: {
  reminders: Reminder[];
  empty?: string;
  onEdit?: (r: Reminder) => void;
  onScheduleNext?: (r: Reminder) => void;
  compact?: boolean;
}) {
  if (reminders.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div>
      {reminders.map((r) => (
        <ReminderRow
          key={r.id}
          reminder={r}
          onEdit={onEdit}
          onScheduleNext={onScheduleNext}
          compact={compact}
        />
      ))}
    </div>
  );
}
