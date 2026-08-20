import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CustomerSelect } from "@/components/finance/FinanceShared";
import { ReminderDialog, type ReminderDialogDefaults } from "@/components/reminders/ReminderDialog";
import { ReminderList } from "@/components/reminders/ReminderList";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contact } from "@/lib/crm";
import type { Project, ProjectStatus } from "@/lib/finance";
import { createProject, deleteProject, updateProject } from "@/lib/finance.functions";
import { remindersQuery, type Reminder } from "@/lib/reminders";

export function ProjectDialog({
  open,
  onOpenChange,
  contacts,
  project,
  defaultContactId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  project?: Project | null;
  defaultContactId?: string;
}) {
  const queryClient = useQueryClient();
  const [contactId, setContactId] = useState(defaultContactId ?? project?.contact_id ?? "");
  const [name, setName] = useState(project?.name ?? "");
  const [value, setValue] = useState(String(project?.value ?? ""));
  const [startDate, setStartDate] = useState(project?.start_date?.slice(0, 10) ?? "");
  const [completionDate, setCompletionDate] = useState(project?.completion_date?.slice(0, 10) ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderDefaults, setReminderDefaults] = useState<ReminderDialogDefaults | undefined>();

  const { data: allReminders = [] } = useQuery({
    ...remindersQuery,
    enabled: open && Boolean(project),
  });

  const projectReminders = useMemo(
    () =>
      allReminders.filter(
        (r) => project && r.project_id === project.id && r.status === "pending",
      ),
    [allReminders, project],
  );

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        contact_id: contactId,
        name: name.trim(),
        value: Number(value),
        start_date: startDate || null,
        completion_date: completionDate || null,
        status,
      };
      if (project) {
        await updateProject({ data: { id: project.id, ...payload } });
      } else {
        await createProject({ data: payload });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["contact-finance"] });
      toast.success(project ? "Project updated" : "Project created");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!project) return;
      await deleteProject({ data: { id: project.id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      toast.success("Project deleted");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openReminder(partial?: ReminderDialogDefaults) {
    if (!project) return;
    setEditingReminder(null);
    setReminderDefaults({
      contactId: contactId || project.contact_id,
      projectId: project.id,
      lockContact: true,
      lockProject: true,
      source: "project",
      ...partial,
    });
    setReminderOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {project && (
              <div className="surface-panel space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Next action</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => openReminder()}>
                    Schedule Next
                  </Button>
                </div>
                <ReminderList
                  reminders={projectReminders.slice(0, 5)}
                  empty="No pending reminders for this project."
                  onEdit={(r) => {
                    setEditingReminder(r);
                    setReminderOpen(true);
                  }}
                  onScheduleNext={(r) =>
                    openReminder({ contactId: r.contact_id, projectId: r.project_id })
                  }
                  compact
                />
              </div>
            )}
            <div>
              <Label className="mb-1.5 block text-xs">Customer</Label>
              <CustomerSelect contacts={contacts} value={contactId} onChange={setContactId} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Project name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Development" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs">Project value (Rs.)</Label>
                <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs">Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Completion date</Label>
                <Input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {project ? (
              <Button variant="destructive" onClick={() => remove.mutate()} disabled={remove.isPending}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => save.mutate()}
                disabled={!contactId || !name.trim() || !value || save.isPending}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        reminder={editingReminder}
        defaults={reminderDefaults}
      />
    </>
  );
}
