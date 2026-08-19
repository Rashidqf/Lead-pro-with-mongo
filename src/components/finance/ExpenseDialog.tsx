import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/crm";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseType,
  type Project,
} from "@/lib/finance";
import { createExpense, deleteExpense, updateExpense } from "@/lib/finance.functions";

export function ExpenseDialog({
  open,
  onOpenChange,
  contacts,
  projects,
  expense,
  defaultType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  projects: Project[];
  expense?: Expense | null;
  defaultType?: ExpenseType;
}) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<ExpenseType>(expense?.type ?? defaultType ?? "business");
  const [category, setCategory] = useState(expense?.category ?? "Other");
  const [contactId, setContactId] = useState(expense?.contact_id ?? "");
  const [projectId, setProjectId] = useState(expense?.project_id ?? "");
  const [amount, setAmount] = useState(String(expense?.amount ?? ""));
  const [date, setDate] = useState(expense?.date.slice(0, 10) ?? today);
  const [description, setDescription] = useState(expense?.description ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        date,
        type,
        category,
        contact_id: type === "project" ? contactId : null,
        project_id: type === "project" ? projectId : null,
        amount: Number(amount),
        description: description.trim() || null,
      };
      if (expense) {
        await updateExpense({ data: { id: expense.id, ...payload } });
      } else {
        await createExpense({ data: payload });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["contact-finance"] });
      toast.success(expense ? "Expense updated" : "Expense recorded");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!expense) return;
      await deleteExpense({ data: { id: expense.id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Expense deleted");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label className="mb-1.5 block text-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ExpenseType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {type === "project" && (
            <>
              <div>
                <Label className="mb-1.5 block text-xs">Customer</Label>
                <CustomerSelect
                  contacts={contacts}
                  value={contactId}
                  onChange={(id) => {
                    setContactId(id);
                    setProjectId("");
                  }}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Project</Label>
                <ProjectSelect
                  projects={projects}
                  contactId={contactId}
                  value={projectId}
                  onChange={setProjectId}
                  disabled={!contactId}
                />
              </div>
            </>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs">Amount (Rs.)</Label>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {expense ? (
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
              disabled={
                !amount ||
                save.isPending ||
                (type === "project" && (!contactId || !projectId))
              }
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
