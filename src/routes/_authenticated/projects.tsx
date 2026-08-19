import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProjectDialog } from "@/components/finance/ProjectDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: payments = [] } = useQuery(paymentsQuery);

  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const contact = contactMap[p.contact_id];
      if (!q) return true;
      return [p.name, contact?.name, contact?.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [projects, contactMap, search]);

  function receivedForProject(projectId: string) {
    return payments
      .filter((p) => p.project_id === projectId)
      .reduce((s, p) => s + p.amount, 0);
  }

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

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search projects or customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No projects yet. Create one for a converted customer.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
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
