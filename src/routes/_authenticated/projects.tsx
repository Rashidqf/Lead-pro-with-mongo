import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ProjectDialog } from "@/components/finance/ProjectDialog";
import {
  FilterSelect,
  ListPagination,
  SearchField,
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
  formatCurrency,
  formatDateLabel,
  paginateItems,
  paymentsQuery,
  projectsQuery,
  type Project,
} from "@/lib/finance";
import { formatPhone } from "@/lib/phone";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [{ title: "Projects — LeadPilot CRM" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [balance, setBalance] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [page, setPage] = useResetPage(search, status, balance);

  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: payments = [] } = useQuery(paymentsQuery);

  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]));

  function receivedForProject(projectId: string) {
    return payments
      .filter((p) => p.project_id === projectId)
      .reduce((s, p) => s + p.amount, 0);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      const received = receivedForProject(p.id);
      const outstanding = Math.max(0, p.value - received);
      if (balance === "outstanding" && outstanding <= 0) return false;
      if (balance === "paid" && outstanding > 0) return false;
      if (!q) return true;
      const contact = contactMap[p.contact_id];
      return [p.name, contact?.name, contact?.phone, p.contact_phone, p.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [projects, contactMap, search, status, balance, payments]);

  const paged = paginateItems(filtered, page);
  const totalValue = filtered.reduce((s, p) => s + p.value, 0);
  const totalOutstanding = filtered.reduce((s, p) => {
    return s + Math.max(0, p.value - receivedForProject(p.id));
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer projects, values, and payment status.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New project
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search projects or customers…"
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          allLabel="All statuses"
          options={[
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "on_hold", label: "On hold" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
        <FilterSelect
          value={balance}
          onChange={setBalance}
          allLabel="All balances"
          options={[
            { value: "outstanding", label: "Has outstanding" },
            { value: "paid", label: "Fully paid" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="surface-panel shadow-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Projects</p>
          <p className="mt-1 text-2xl font-semibold">{filtered.length}</p>
        </div>
        <div className="surface-panel shadow-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total value</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(totalValue)}</p>
        </div>
        <div className="surface-panel shadow-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-destructive">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
      </div>

      <div className="surface-panel shadow-card mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead>Start</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.total === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No projects match these filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.items.map((p) => {
                const contact = contactMap[p.contact_id];
                const received = receivedForProject(p.id);
                const outstanding = Math.max(0, p.value - received);
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setEditing(p);
                      setDialogOpen(true);
                    }}
                  >
                    <TableCell>
                      <div>{contact?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPhone(contact?.phone ?? p.contact_phone)}
                      </div>
                    </TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="capitalize">{p.status.replace("_", " ")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.value)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(received)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${outstanding > 0 ? "text-destructive" : ""}`}
                    >
                      {formatCurrency(outstanding)}
                    </TableCell>
                    <TableCell>{p.start_date ? formatDateLabel(p.start_date) : "—"}</TableCell>
                  </TableRow>
                );
              })
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

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contacts={contacts}
        project={editing}
      />
    </div>
  );
}
