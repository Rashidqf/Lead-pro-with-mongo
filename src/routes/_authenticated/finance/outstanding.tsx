import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
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
  financeDashboardQuery,
  formatCurrency,
  paginateItems,
  projectsQuery,
  type DateRange,
} from "@/lib/finance";
import { formatPhone } from "@/lib/phone";

export const Route = createFileRoute("/_authenticated/finance/outstanding")({
  head: () => ({
    meta: [{ title: "Outstanding — LeadPilot CRM" }],
  }),
  component: OutstandingPage,
});

function OutstandingPage() {
  const [range] = useState<DateRange>(() => useDefaultDateRange());
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [page, setPage] = useResetPage(search, projectId);

  const { data, isLoading } = useQuery(financeDashboardQuery(range));
  const { data: projects = [] } = useQuery(projectsQuery);

  const filtered = useMemo(() => {
    const rows = data?.outstanding ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (projectId !== "all" && row.project_id !== projectId) return false;
      if (!q) return true;
      return [row.contact_name, row.contact_phone, row.project_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data?.outstanding, search, projectId]);

  const total = filtered.reduce((s, r) => s + r.amount_remaining, 0);
  const paged = paginateItems(filtered, page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search customer or project…"
        />
        <FilterSelect
          value={projectId}
          onChange={setProjectId}
          allLabel="All projects"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
        />
      </div>

      <div className="surface-panel shadow-card p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total outstanding
        </span>
        <p className="mt-2 text-3xl font-semibold text-destructive">
          {isLoading ? "…" : formatCurrency(total)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {filtered.length} projects with unpaid balance
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
            ) : paged.total === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No outstanding balances match these filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.items.map((row) => (
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
