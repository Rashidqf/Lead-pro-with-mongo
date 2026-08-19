import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactDialog } from "@/components/crm/ContactDialog";
import { ImportContactsButton } from "@/components/crm/ImportContactsButton";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { columnsQuery, contactsQuery, displayName, profilesQuery, type Contact } from "@/lib/crm";
import { useCrmAuth } from "@/hooks/use-crm-auth";

export const Route = createFileRoute("/_authenticated/board")({
  head: () => ({
    meta: [
      { title: "Pipeline board — LeadPilot CRM" },
      { name: "description", content: "Drag and drop leads through your sales pipeline columns." },
      { property: "og:title", content: "Pipeline board — LeadPilot CRM" },
      { property: "og:description", content: "Drag and drop leads through your sales pipeline." },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  const { isAdmin } = useCrmAuth();
  const { data: columns = [] } = useQuery(columnsQuery);
  const { data: contacts = [], isLoading } = useQuery(contactsQuery);
  const { data: profiles = [] } = useQuery(profilesQuery);

  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = contacts.filter((c) => {
      if (assignee === "unassigned" && c.assigned_to) return false;
      if (assignee !== "all" && assignee !== "unassigned" && c.assigned_to !== assignee)
        return false;
      if (!q) return true;
      return [c.name, c.company, c.phone, c.email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
    list = [...list].sort((a, b) =>
      sort === "newest"
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at),
    );
    return list;
  }, [contacts, search, assignee, sort]);

  const live = selected ? (contacts.find((c) => c.id === selected.id) ?? selected) : null;

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 py-4 sm:px-6">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, phone or email…"
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="w-[190px]">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
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
        <span className="text-xs text-muted-foreground">{filtered.length} cards</span>
        <ImportContactsButton />
      </div>

      {isLoading ? (
        <p className="px-6 text-sm text-muted-foreground">Loading board…</p>
      ) : (
        <KanbanBoard
          columns={columns}
          contacts={filtered}
          profiles={profiles}
          onOpenContact={setSelected}
        />
      )}

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