import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CustomerSelect, ProjectSelect } from "@/components/finance/FinanceShared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactsQuery, profilesQuery, displayName } from "@/lib/crm";
import { projectsQuery } from "@/lib/finance";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import {
  REMINDER_TYPES,
  calendarDefaultOn,
  createReminder,
  suggestedDueAt,
  updateReminder,
  type Reminder,
  type ReminderSource,
  type ReminderType,
} from "@/lib/reminders";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReminderDialogDefaults = {
  contactId?: string;
  projectId?: string | null;
  type?: ReminderType;
  source?: ReminderSource;
  lockContact?: boolean;
  lockProject?: boolean;
};

export function ReminderDialog({
  open,
  onOpenChange,
  reminder,
  defaults,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder | null;
  defaults?: ReminderDialogDefaults;
  onCreated?: (r: Reminder) => void;
}) {
  const { userId, isAdmin } = useCrmAuth();
  const queryClient = useQueryClient();
  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: profiles = [] } = useQuery(profilesQuery);

  const [type, setType] = useState<ReminderType>("call");
  const [contactId, setContactId] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueLocal, setDueLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [notify, setNotify] = useState(true);
  const [addToCalendar, setAddToCalendar] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (reminder) {
      setType(reminder.type);
      setContactId(reminder.contact_id);
      setProjectId(reminder.project_id ?? "none");
      setAssignedTo(reminder.assigned_to);
      setDueLocal(toLocalInput(reminder.due_at));
      setNotes(reminder.notes ?? "");
      setNotify(true);
      setAddToCalendar(Boolean(reminder.google_event_id) || calendarDefaultOn(reminder.type));
      return;
    }
    const t = defaults?.type ?? "call";
    setType(t);
    setContactId(defaults?.contactId ?? "");
    setProjectId(defaults?.projectId ?? "none");
    setAssignedTo(userId ?? "");
    setDueLocal(toLocalInput(suggestedDueAt(t).toISOString()));
    setNotes("");
    setNotify(true);
    setAddToCalendar(calendarDefaultOn(t));
  }, [open, reminder, defaults, userId]);

  useEffect(() => {
    if (reminder || !open) return;
    setAddToCalendar(calendarDefaultOn(type));
    setDueLocal(toLocalInput(suggestedDueAt(type).toISOString()));
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const projectOptions = useMemo(
    () =>
      contactId
        ? projects.filter((p) => p.contact_id === contactId)
        : projects,
    [projects, contactId],
  );

  const save = useMutation({
    mutationFn: async () => {
      if (!contactId) throw new Error("Select a customer");
      if (!dueLocal) throw new Error("Pick a date and time");
      const due_at = new Date(dueLocal).toISOString();
      const payload = {
        type,
        contact_id: contactId,
        project_id: projectId === "none" ? null : projectId,
        assigned_to: assignedTo || userId || undefined,
        due_at,
        notes: notes.trim() || null,
        source: defaults?.source ?? ("manual" as const),
        add_to_calendar: addToCalendar,
        notify,
      };
      if (reminder) {
        return updateReminder({
          data: {
            id: reminder.id,
            type: payload.type,
            contact_id: payload.contact_id,
            project_id: payload.project_id,
            assigned_to: payload.assigned_to,
            due_at: payload.due_at,
            notes: payload.notes,
            add_to_calendar: payload.add_to_calendar,
          },
        });
      }
      return createReminder({ data: payload });
    },
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminder-buckets"] });
      toast.success(reminder ? "Reminder updated" : "Reminder scheduled");
      onCreated?.(r);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{reminder ? "Edit reminder" : "Schedule next"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">What?</Label>
            <div className="flex flex-wrap gap-1.5">
              {REMINDER_TYPES.map((t) => (
                <Button
                  key={t.value}
                  type="button"
                  size="sm"
                  variant={type === t.value ? "default" : "outline"}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">When?</Label>
            <Input
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Customer</Label>
            <CustomerSelect
              contacts={contacts}
              value={contactId}
              onChange={(id) => {
                setContactId(id);
                setProjectId("none");
              }}
              disabled={defaults?.lockContact || Boolean(reminder)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Project (optional)</Label>
            <ProjectSelect
              projects={projectOptions}
              contactId={contactId || undefined}
              value={projectId}
              onChange={setProjectId}
              allowNone
              disabled={defaults?.lockProject}
            />
          </div>

          {isAdmin && (
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Assignee</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to…" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {displayName(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              Notify me
            </label>
            <label className={cn("flex items-center gap-2", "opacity-80")}>
              <input
                type="checkbox"
                checked={addToCalendar}
                onChange={(e) => setAddToCalendar(e.target.checked)}
              />
              Add to Google Calendar
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Calendar sync activates after you connect Google on the Reminders page. CRM always saves.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toLocalInput(iso: string) {
  try {
    return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}
