import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { REMINDER_TYPES, type ReminderType } from "@/lib/reminders";

const QUICK: ReminderType[] = [
  "call",
  "send_proposal",
  "whatsapp_followup",
  "meeting",
  "payment_followup",
  "general_task",
];

export function NextActionBar({
  onSchedule,
  onQuick,
}: {
  onSchedule: () => void;
  onQuick: (type: ReminderType) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">Next Action</h3>
        <Button type="button" size="sm" onClick={onSchedule}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Schedule
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((type) => {
          const label = REMINDER_TYPES.find((t) => t.value === type)?.label ?? type;
          return (
            <Button
              key={type}
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onQuick(type)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
