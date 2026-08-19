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
import { PAYMENT_METHODS, type Payment, type Project } from "@/lib/finance";
import { createPayment, deletePayment, updatePayment } from "@/lib/finance.functions";

export function PaymentDialog({
  open,
  onOpenChange,
  contacts,
  projects,
  payment,
  defaultContactId,
  defaultProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  projects: Project[];
  payment?: Payment | null;
  defaultContactId?: string;
  defaultProjectId?: string;
}) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [contactId, setContactId] = useState(defaultContactId ?? payment?.contact_id ?? "");
  const [projectId, setProjectId] = useState(
    defaultProjectId ?? payment?.project_id ?? "none",
  );
  const [amount, setAmount] = useState(String(payment?.amount ?? ""));
  const [date, setDate] = useState(payment?.date.slice(0, 10) ?? today);
  const [method, setMethod] = useState(payment?.payment_method ?? "Cash");
  const [description, setDescription] = useState(payment?.description ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        contact_id: contactId,
        project_id: projectId === "none" ? null : projectId,
        amount: Number(amount),
        date,
        payment_method: method,
        description: description.trim() || null,
      };
      if (payment) {
        await updatePayment({ data: { id: payment.id, ...payload } });
      } else {
        await createPayment({ data: payload });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["contact-finance"] });
      toast.success(payment ? "Payment updated" : "Payment recorded");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!payment) return;
      await deletePayment({ data: { id: payment.id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Payment deleted");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? "Edit payment" : "Record payment"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label className="mb-1.5 block text-xs">Customer</Label>
            <CustomerSelect
              contacts={contacts}
              value={contactId}
              onChange={(id) => {
                setContactId(id);
                setProjectId("none");
              }}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Project (optional)</Label>
            <ProjectSelect
              projects={projects}
              contactId={contactId}
              value={projectId}
              onChange={setProjectId}
              allowNone
              disabled={!contactId}
            />
          </div>
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
            <Label className="mb-1.5 block text-xs">Payment method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Advance payment, final payment, etc."
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {payment ? (
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
            <Button onClick={() => save.mutate()} disabled={!contactId || !amount || save.isPending}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
