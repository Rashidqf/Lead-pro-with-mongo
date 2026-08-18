import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import { deleteContact, updateContact } from "@/lib/crm.functions";
import { type BoardColumn, type Contact, type Profile } from "@/lib/crm";
import { AssignUserSelect } from "./AssignUserSelect";

type Form = {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  tags: string;
  column_id: string;
  assigned_to: string | null;
};

export function ContactDialog({
  contact,
  columns,
  profiles,
  open,
  onOpenChange,
}: {
  contact: Contact | null;
  columns: BoardColumn[];
  profiles: Profile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isAdmin } = useCrmAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (!contact) return setForm(null);
    setForm({
      name: contact.name,
      company: contact.company ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      address: contact.address ?? "",
      notes: contact.notes ?? "",
      tags: (contact.tags ?? []).join(", "),
      column_id: contact.column_id ?? "",
      assigned_to: contact.assigned_to,
    });
  }, [contact]);

  const save = useMutation({
    mutationFn: async () => {
      if (!contact || !form) return;
      const payload = {
        name: form.name.trim().slice(0, 200) || "Untitled",
        company: form.company.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        column_id: form.column_id || null,
        ...(isAdmin ? { assigned_to: form.assigned_to } : {}),
      };
      await updateContact({
        data: {
          id: contact.id,
          ...payload,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Contact saved");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!contact) return;
      await deleteContact({ data: { id: contact.id, name: contact.name } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!contact || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{contact.name}</DialogTitle>
          <DialogDescription>
            Created {new Date(contact.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Company">
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.column_id}
              onValueChange={(v) => setForm({ ...form, column_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Assigned user">
            <AssignUserSelect
              profiles={profiles}
              value={form.assigned_to}
              disabled={!isAdmin}
              onChange={(v) => setForm({ ...form, assigned_to: v })}
            />
          </Field>
          <Field label="Tags (comma separated)" className="sm:col-span-2">
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          {contact.last_message && (
            <Field label="Last imported message" className="sm:col-span-2">
              <p className="surface-panel max-h-40 overflow-y-auto whitespace-pre-wrap p-3 text-xs text-muted-foreground">
                {contact.last_message}
              </p>
            </Field>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {isAdmin ? (
            <Button
              variant="destructive"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}