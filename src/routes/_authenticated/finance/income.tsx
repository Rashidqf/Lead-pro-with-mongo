import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { PaymentDialog } from "@/components/finance/PaymentDialog";
import { DateRangeSelector, useDefaultDateRange } from "@/components/finance/FinanceShared";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { contactsQuery } from "@/lib/crm";
import {
  formatCurrency,
  formatDateLabel,
  paymentsQuery,
  projectsQuery,
  resolveDateRange,
  type DateRange,
  type Payment,
} from "@/lib/finance";
import { formatPhone } from "@/lib/phone";

export const Route = createFileRoute("/_authenticated/finance/income")({
  head: () => ({
    meta: [{ title: "Income — LeadPilot CRM" }],
  }),
  component: IncomePage,
});

function IncomePage() {
  const [range, setRange] = useState<DateRange>(() => useDefaultDateRange());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const { data: payments = [] } = useQuery(paymentsQuery);
  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: projects = [] } = useQuery(projectsQuery);

  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const filtered = useMemo(() => {
    const { from, to } = resolveDateRange(range.preset, range.from, range.to);
    return payments.filter((p) => {
      const d = new Date(p.date);
      return d >= from && d <= to;
    });
  }, [payments, range]);

  const total = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangeSelector value={range} onChange={setRange} />
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Record payment
        </Button>
      </div>

      <div className="surface-panel shadow-card p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total income
        </span>
        <p className="mt-2 text-3xl font-semibold">{formatCurrency(total)}</p>
      </div>

      <div className="surface-panel shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No payments in this period.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setEditing(p);
                    setDialogOpen(true);
                  }}
                >
                  <TableCell>{formatDateLabel(p.date)}</TableCell>
                  <TableCell>
                    <div>{contactMap[p.contact_id]?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPhone(p.contact_phone)}
                    </div>
                  </TableCell>
                  <TableCell>{p.project_id ? (projectMap[p.project_id]?.name ?? "—") : "—"}</TableCell>
                  <TableCell>{p.payment_method}</TableCell>
                  <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell>{p.description ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contacts={contacts}
        projects={projects}
        payment={editing}
      />
    </div>
  );
}
