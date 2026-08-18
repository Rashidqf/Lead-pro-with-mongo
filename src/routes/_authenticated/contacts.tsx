import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactDialog } from "@/components/crm/ContactDialog";
import { AssignUserSelect } from "@/components/crm/AssignUserSelect";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import {
  columnsQuery,
  contactsQuery,
  displayName,
  profilesQuery,
  type Contact,
} from "@/lib/crm";
import { createContact as createContactFn, importContacts, updateContact } from "@/lib/crm.functions";
import { parseCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — LeadPilot CRM" },
      { name: "description", content: "Search, filter, import and assign every contact in your CRM." },
      { property: "og:title", content: "Contacts — LeadPilot CRM" },
      { property: "og:description", content: "Search, filter, import and assign your CRM contacts." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { isAdmin } = useCrmAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: columns = [] } = useQuery(columnsQuery);
  const { data: profiles = [] } = useQuery(profilesQuery);

  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [columnFilter, setColumnFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [limit, setLimit] = useState(50);

  const columnMap = Object.fromEntries(columns.map((c) => [c.id, c]));
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => {
        if (columnFilter !== "all" && c.column_id !== columnFilter) return false;
        if (assignee === "unassigned" && c.assigned_to) return false;
        if (assignee !== "all" && assignee !== "unassigned" && c.assigned_to !== assignee)
          return false;
        if (!q) return true;
        return [c.name, c.company, c.phone, c.email]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
      .sort((a, b) =>
        sort === "newest"
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at),
      );
  }, [contacts, search, assignee, columnFilter, sort]);

  const createContact = useMutation({
    mutationFn: async () => {
      const leads = columns.find((c) => c.name === "Leads") ?? columns[0];
      return createContactFn({
        data: { name: "New contact", column_id: leads?.id ?? null },
      });
    },
    onSuccess: (contact) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelected(contact);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assign = useMutation({
    mutationFn: async ({ id, userIdValue }: { id: string; userIdValue: string | null }) => {
      await updateContact({ data: { id, assigned_to: userIdValue } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Assignment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const importCsv = useMutation({
    mutationFn: async (file: File) => {
      const rows = parseCsv(await file.text());
      const leads = columns.find((c) => c.name === "Leads") ?? columns[0];
      const pick = (row: Record<string, string>, keys: string[]) => {
        for (const key of keys) {
          const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
          if (found && row[found]?.trim()) return row[found].trim();
        }
        return null;
      };
      const payload = rows
        .map((row) => ({
          name:
            pick(row, ["name", "name_or_number", "full_name", "contact"]) ??
            pick(row, ["phone", "phone_number"]) ??
            "Unnamed",
          phone: pick(row, ["phone", "phone_number", "mobile"]),
          email: pick(row, ["email", "email_address"]),
          company: pick(row, ["company", "organization", "business"]),
          address: pick(row, ["address", "location", "city"]),
          notes: pick(row, ["notes", "note", "comment"]),
          last_activity_date: pick(row, ["last_activity_date", "last_activity"]),
          last_message: pick(row, ["last_message", "message"]),
          column_id: leads?.id ?? null,
        }))
        .filter((r) => r.name);
      if (!payload.length) throw new Error("No rows found in that CSV");
      const result = await importContacts({
        data: { column_id: leads?.id ?? null, rows: payload },
      });
      return result.count;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(`Imported ${count} contacts`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const live = selected ? (contacts.find((c) => c.id === selected.id) ?? selected) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} records</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importCsv.mutate(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={importCsv.isPending}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              {importCsv.isPending ? "Importing…" : "Import CSV"}
            </Button>
            <Button onClick={() => createContact.mutate()}>
              <Plus className="mr-1.5 h-4 w-4" />
              New contact
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, phone, email…"
            className="pl-9"
          />
        </div>
        <Select value={columnFilter} onValueChange={setColumnFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {displayName(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="surface-panel shadow-card mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, limit).map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell className="font-medium" onClick={() => setSelected(c)}>
                  {c.name}
                </TableCell>
                <TableCell onClick={() => setSelected(c)}>{c.company ?? "—"}</TableCell>
                <TableCell onClick={() => setSelected(c)}>{c.phone ?? "—"}</TableCell>
                <TableCell onClick={() => setSelected(c)}>{c.email ?? "—"}</TableCell>
                <TableCell onClick={() => setSelected(c)}>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {c.column_id ? (columnMap[c.column_id]?.name ?? "—") : "—"}
                  </span>
                </TableCell>
                <TableCell className="w-[210px]">
                  {isAdmin ? (
                    <AssignUserSelect
                      profiles={profiles}
                      value={c.assigned_to}
                      onChange={(v) => assign.mutate({ id: c.id, userIdValue: v })}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {displayName(c.assigned_to ? profileMap[c.assigned_to] : null)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length > limit && (
          <div className="border-t border-border p-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + 50)}>
              Load more
            </Button>
          </div>
        )}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No contacts match.</p>
        )}
      </div>

      <ContactDialog
        contact={live}
        columns={columns}
        profiles={profiles}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}