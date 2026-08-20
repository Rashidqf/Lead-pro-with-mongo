import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  DateRangeSelector,
  FilterSelect,
  ListPagination,
  SearchField,
  useDefaultDateRange,
  useResetPage,
} from "@/components/finance/FinanceShared";
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
  paginateItems,
  projectsQuery,
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
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useResetPage(range, search, projectId, type);

  const { data: txs = [], isLoading } = useQuery(transactionsQuery(range));
  const { data: projects = [] } = useQuery(projectsQuery);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return txs.filter((tx) => {
      if (projectId !== "all" && tx.project_id !== projectId) return false;
      if (type !== "all" && tx.type !== type) return false;
      if (!q) return true;
      return [tx.contact_name, tx.project_name, tx.category, tx.description, tx.payment_method]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [txs, search, projectId, type]);

  const paged = paginateItems(filtered, page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search customer, project, notes…"
        />
        <DateRangeSelector value={range} onChange={setRange} />
        <FilterSelect
          value={projectId}
          onChange={setProjectId}
          allLabel="All projects"
          placeholder="Project"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
        />
        <FilterSelect
          value={type}
          onChange={setType}
          allLabel="All types"
          placeholder="Type"
          options={[
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ]}
        />
      </div>

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
            ) : paged.total === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No transactions match these filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.items.map((tx) => (
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
        <ListPagination
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
