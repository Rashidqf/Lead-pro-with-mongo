import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  cancelReminder,
  completeReminder,
  formatReminderWhen,
  REMINDER_TYPE_LABELS,
  type Reminder,
} from "@/lib/reminders";

export function ReminderRow({
  reminder,
  onEdit,
  onScheduleNext,
  compact,
}: {
  reminder: Reminder;
  onEdit?: (r: Reminder) => void;
  onScheduleNext?: (r: Reminder) => void;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: () => completeReminder({ data: { id: reminder.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminder-buckets"] });
      toast.success("Done", {
        action: onScheduleNext
          ? {
              label: "Schedule next",
              onClick: () => onScheduleNext(reminder),
            }
          : undefined,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: () => cancelReminder({ data: { id: reminder.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminder-buckets"] });
      toast.success("Cancelled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      className={`flex items-start justify-between gap-3 ${compact ? "py-2" : "border-b border-border py-3 last:border-0"}`}
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onEdit?.(reminder)}
      >
        <p className="truncate text-sm font-medium">
          {REMINDER_TYPE_LABELS[reminder.type]}
          {reminder.title !== REMINDER_TYPE_LABELS[reminder.type] ? ` · ${reminder.title}` : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {reminder.contact_name ?? "Customer"}
          {reminder.project_name ? ` · ${reminder.project_name}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">{formatReminderWhen(reminder.due_at)}</p>
      </button>
      {reminder.status === "pending" && (
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Complete"
            onClick={() => complete.mutate()}
            disabled={complete.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Cancel"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
