import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { CustomerSelect } from "@/components/finance/FinanceShared";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
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
  );
}
