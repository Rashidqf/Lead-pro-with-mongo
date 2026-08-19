import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

import {
  DateRangeSelector,
  MetricCard,
  useDefaultDateRange,
} from "@/components/finance/FinanceShared";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  financeDashboardQuery,
  formatCurrency,
  formatDateLabel,
  type DateRange,
} from "@/lib/finance";
import { formatPhone } from "@/lib/phone";

export const Route = createFileRoute("/_authenticated/finance/")({
  head: () => ({
    meta: [{ title: "Finance Overview — LeadPilot CRM" }],
  }),
  component: FinanceOverviewPage,
});

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
  profit: { label: "Profit", color: "hsl(var(--chart-3))" },
};

function FinanceOverviewPage() {
  const [range, setRange] = useState<DateRange>(() => useDefaultDateRange());
  const { data, isLoading } = useQuery(financeDashboardQuery(range));

  const m = data?.metrics;

  return (
    <div className="space-y-6">
      <DateRangeSelector value={range} onChange={setRange} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={isLoading ? "…" : formatCurrency(m?.revenue ?? 0)}
        />
        <MetricCard
          label="Business expenses"
          value={isLoading ? "…" : formatCurrency(m?.businessExpenses ?? 0)}
        />
        <MetricCard
          label="Net profit"
          value={isLoading ? "…" : formatCurrency(m?.netProfit ?? 0)}
          negative={(m?.netProfit ?? 0) < 0}
          sub={(m?.netProfit ?? 0) < 0 ? "Loss in selected period" : undefined}
        />
        <MetricCard
          label="Outstanding"
          value={isLoading ? "…" : formatCurrency(m?.outstanding ?? 0)}
          sub="Total unpaid across all projects"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="New leads" value={isLoading ? "…" : String(m?.newLeads ?? 0)} />
        <MetricCard label="Converted leads" value={isLoading ? "…" : String(m?.convertedLeads ?? 0)} />
        <MetricCard
          label="Conversion rate"
          value={isLoading ? "…" : `${m?.conversionRate ?? 0}%`}
        />
      </div>

      <div className="surface-panel shadow-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Revenue vs expenses</h2>
        {isLoading || !data?.chart.length ? (
          <p className="mt-4 text-sm text-muted-foreground">No data for this period.</p>
        ) : (
          <ChartContainer config={chartConfig} className="mt-4 h-72 w-full">
            <BarChart data={data.chart}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      <div className="surface-panel shadow-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Outstanding payments</h2>
        {!data?.outstanding.length ? (
          <p className="mt-4 text-sm text-muted-foreground">All projects are fully paid.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.outstanding.slice(0, 10).map((row) => (
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
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
