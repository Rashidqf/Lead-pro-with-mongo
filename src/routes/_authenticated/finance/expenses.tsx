import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ExpenseDialog } from "@/components/finance/ExpenseDialog";
import {
  DateRangeSelector,
  FilterSelect,
  ListPagination,
  SearchField,
  useDefaultDateRange,
  useResetPage,
} from "@/components/finance/FinanceShared";
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
  EXPENSE_CATEGORIES,
  expensesQuery,
  formatCurrency,
  formatDateLabel,
  paginateItems,
  projectsQuery,
  resolveDateRange,
  type DateRange,
  type Expense,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/finance/expenses")({
  head: () => ({
    meta: [{ title: "Expenses — LeadPilot CRM" }],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const [range, setRange] = useState<DateRange>(() => useDefaultDateRange());
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [expenseType, setExpenseType] = useState("all");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [page, setPage] = useResetPage(range, search, projectId, expenseType, category);

  const { data: expenses = [] } = useQuery(expensesQuery);
  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: projects = [] } = useQuery(projectsQuery);

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const filtered = useMemo(() => {
    const { from, to } = resolveDateRange(range.preset, range.from, range.to);
    const q = search.trim().toLowerCase();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      if (d < from || d > to) return false;
      if (projectId !== "all" && e.project_id !== projectId) return false;
      if (expenseType !== "all" && e.type !== expenseType) return false;
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return [e.category, e.type, e.description, projectMap[e.project_id ?? ""]?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [expenses, range, search, projectId, expenseType, category, projectMap]);

  const businessTotal = filtered
    .filter((e) => e.type === "business")
    .reduce((s, e) => s + e.amount, 0);
  const projectTotal = filtered
    .filter((e) => e.type === "project")
    .reduce((s, e) => s + e.amount, 0);
  const personalTotal = filtered
    .filter((e) => e.type === "personal")
    .reduce((s, e) => s + e.amount, 0);
  const paged = paginateItems(filtered, page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search category, project, notes…"
          />
          <DateRangeSelector value={range} onChange={setRange} />
          <FilterSelect
            value={projectId}
            onChange={setProjectId}
            allLabel="All projects"
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <FilterSelect
            value={expenseType}
            onChange={setExpenseType}
            allLabel="All types"
            options={[
              { value: "business", label: "Business" },
              { value: "project", label: "Project" },
              { value: "personal", label: "Personal" },
            ]}
          />
          <FilterSelect
            value={category}
            onChange={setCategory}
            allLabel="All categories"
            className="w-[190px]"
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-panel shadow-card p-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Business
          </span>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(businessTotal)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Affects net profit</p>
        </div>
        <div className="surface-panel shadow-card p-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Project
          </span>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(projectTotal)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Reduces project profit</p>
        </div>
        <div className="surface-panel shadow-card p-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Personal
          </span>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(personalTotal)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Tracked separately</p>
        </div>
      </div>

      <div className="surface-panel shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.total === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No expenses match these filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.items.map((e) => (
                <TableRow
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setEditing(e);
                    setDialogOpen(true);
                  }}
                >
                  <TableCell>{formatDateLabel(e.date)}</TableCell>
                  <TableCell className="capitalize">{e.type}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell>
                    {e.project_id ? (projectMap[e.project_id]?.name ?? "—") : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {formatCurrency(e.amount)}
                  </TableCell>
                  <TableCell>{e.description ?? "—"}</TableCell>
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

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contacts={contacts}
        projects={projects}
        expense={editing}
      />
    </div>
  );
}
