import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DateRangeSelector, useDefaultDateRange } from "@/components/finance/FinanceShared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDateLabel,
  transactionsQuery,
  type DateRange,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/finance/transactions")({
  head: () => ({
    meta: [{ title: "Transactions — LeadPilot CRM" }],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [range, setRange] = useState<DateRange>(() => useDefaultDateRange());
  const { data: txs = [], isLoading } = useQuery(transactionsQuery(range));

  return (
    <div className="space-y-6">
      <DateRangeSelector value={range} onChange={setRange} />

      <div className="surface-panel shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : txs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No transactions in this period.
                </TableCell>
              </TableRow>
            ) : (
              txs.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDateLabel(tx.date)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        tx.type === "income"
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-destructive"
                      }
                    >
                      {tx.type === "income" ? "Income" : "Expense"}
                    </span>
                  </TableCell>
                  <TableCell>{tx.contact_name ?? "—"}</TableCell>
                  <TableCell>{tx.project_name ?? "—"}</TableCell>
                  <TableCell>
                    {tx.category ?? tx.payment_method ?? "—"}
                    {tx.expense_type ? ` (${tx.expense_type})` : ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{tx.description ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
