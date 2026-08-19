import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useDefaultDateRange } from "@/components/finance/FinanceShared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { financeDashboardQuery, formatCurrency, type DateRange } from "@/lib/finance";
import { formatPhone } from "@/lib/phone";

export const Route = createFileRoute("/_authenticated/finance/outstanding")({
  head: () => ({
    meta: [{ title: "Outstanding — LeadPilot CRM" }],
  }),
  component: OutstandingPage,
});

function OutstandingPage() {
  const [range] = useState<DateRange>(() => useDefaultDateRange());
  const { data, isLoading } = useQuery(financeDashboardQuery(range));

  const total = data?.outstanding.reduce((s, r) => s + r.amount_remaining, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="surface-panel shadow-card p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total outstanding
        </span>
        <p className="mt-2 text-3xl font-semibold text-destructive">
          {isLoading ? "…" : formatCurrency(total)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Amount customers still owe across all projects
        </p>
      </div>

      <div className="surface-panel shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Project value</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !data?.outstanding.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  All projects are fully paid.
                </TableCell>
              </TableRow>
            ) : (
              data.outstanding.map((row) => (
                <TableRow key={row.project_id}>
                  <TableCell>
                    <div>{row.contact_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPhone(row.contact_phone)}
                    </div>
                  </TableCell>
                  <TableCell>{row.project_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.project_value)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.amount_received)}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {formatCurrency(row.amount_remaining)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
