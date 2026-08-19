import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ExpenseDialog } from "@/components/finance/ExpenseDialog";
import { PaymentDialog } from "@/components/finance/PaymentDialog";
import { ProjectDialog } from "@/components/finance/ProjectDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contact } from "@/lib/crm";
import {
  contactFinanceQuery,
  formatCurrency,
  projectsQuery,
} from "@/lib/finance";
import { markContactConverted } from "@/lib/finance.functions";

export function ContactFinancePanel({ contact }: { contact: Contact }) {
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useQuery(contactFinanceQuery(contact.id));
  const { data: allProjects = [] } = useQuery(projectsQuery);

  const [projectOpen, setProjectOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const contactProjects = allProjects.filter((p) => p.contact_id === contact.id);

  const convert = useMutation({
    mutationFn: () => markContactConverted({ data: { contactId: contact.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] });
      toast.success("Lead marked as converted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading financial summary…</p>;
  }

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">Financial summary</h3>
        <Button size="sm" variant="outline" onClick={() => convert.mutate()} disabled={convert.isPending}>
          Mark as converted
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Projects" value={String(summary?.total_projects ?? 0)} />
        <Stat label="Project value" value={formatCurrency(summary?.total_project_value ?? 0)} />
        <Stat label="Received" value={formatCurrency(summary?.total_received ?? 0)} />
        <Stat label="Outstanding" value={formatCurrency(summary?.outstanding ?? 0)} negative />
        <Stat label="Project expenses" value={formatCurrency(summary?.project_expenses ?? 0)} />
        <Stat
          label="Net profit"
          value={formatCurrency(summary?.net_profit ?? 0)}
          negative={(summary?.net_profit ?? 0) < 0}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setProjectOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add project
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPaymentOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Record payment
        </Button>
        <Button size="sm" variant="outline" onClick={() => setExpenseOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Project expense
        </Button>
      </div>

      {summary?.projects.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.projects.map((p) => (
              <TableRow key={p.project.id}>
                <TableCell>{p.project.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(p.project.value)}</TableCell>
                <TableCell className="text-right">{formatCurrency(p.amount_received)}</TableCell>
                <TableCell className="text-right">{formatCurrency(p.outstanding)}</TableCell>
                <TableCell
                  className={`text-right ${p.estimated_profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                >
                  {formatCurrency(p.estimated_profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No projects for this customer yet.</p>
      )}

      <ProjectDialog
        open={projectOpen}
        onOpenChange={setProjectOpen}
        contacts={[contact]}
        defaultContactId={contact.id}
      />
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        contacts={[contact]}
        projects={contactProjects}
        defaultContactId={contact.id}
      />
      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        contacts={[contact]}
        projects={contactProjects}
        defaultType="project"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="surface-panel p-3">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <p className={`mt-1 text-lg font-semibold ${negative ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}
