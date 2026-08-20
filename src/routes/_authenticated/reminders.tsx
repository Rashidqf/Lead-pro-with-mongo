import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { NextActionBar } from "@/components/reminders/NextActionBar";
import { ReminderDialog, type ReminderDialogDefaults } from "@/components/reminders/ReminderDialog";
import { ReminderIntegrations } from "@/components/reminders/ReminderIntegrations";
import { ReminderList } from "@/components/reminders/ReminderList";
import {
  FilterSelect,
  ListPagination,
  SearchField,
  useResetPage,
} from "@/components/finance/FinanceShared";
import { Button } from "@/components/ui/button";
import { paginateItems } from "@/lib/finance";
import {
  PAGE_SIZE,
  reminderBucketsQuery,
  remindersQuery,
  type Reminder,
} from "@/lib/reminders";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [{ title: "Reminders — LeadPilot CRM" }],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [defaults, setDefaults] = useState<ReminderDialogDefaults | undefined>();
  const [page, setPage] = useResetPage(search, status, type);

  const { data: reminders = [] } = useQuery(remindersQuery);
  const { data: buckets } = useQuery(reminderBucketsQuery);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reminders.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (type !== "all" && r.type !== type) return false;
      if (!q) return true;
      return [r.title, r.contact_name, r.project_name, r.notes, r.type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [reminders, search, status, type]);

  const paged = paginateItems(filtered, page, PAGE_SIZE);

  function openCreate(partial?: ReminderDialogDefaults) {
    setEditing(null);
    setDefaults({ source: "manual", ...partial });
    setDialogOpen(true);
  }

  function openScheduleNext(from: Reminder) {
    setEditing(null);
    setDefaults({
      contactId: from.contact_id,
      projectId: from.project_id,
      source: "manual",
    });
    setDialogOpen(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What you need to do next — overdue, today, and upcoming.
          </p>
        </div>
        <Button onClick={() => openCreate({ source: "manual" })}>
          <Plus className="mr-1.5 h-4 w-4" />
          New reminder
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <BucketCard
          title="Overdue"
          count={buckets?.overdue.length ?? 0}
          reminders={buckets?.overdue ?? []}
          onEdit={(r) => {
            setEditing(r);
            setDialogOpen(true);
          }}
          onScheduleNext={openScheduleNext}
        />
        <BucketCard
          title="Due today"
          count={buckets?.dueToday.length ?? 0}
          reminders={buckets?.dueToday ?? []}
          onEdit={(r) => {
            setEditing(r);
            setDialogOpen(true);
          }}
          onScheduleNext={openScheduleNext}
        />
        <BucketCard
          title="Upcoming"
          count={buckets?.upcoming.length ?? 0}
          reminders={buckets?.upcoming ?? []}
          onEdit={(r) => {
            setEditing(r);
            setDialogOpen(true);
          }}
          onScheduleNext={openScheduleNext}
        />
      </div>

      <div className="mt-6 surface-panel shadow-card p-5">
        <NextActionBar
          onSchedule={() => openCreate({ source: "dashboard" })}
          onQuick={(t) => openCreate({ type: t, source: "dashboard" })}
        />
      </div>

      <div className="mt-6 surface-panel shadow-card p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <SearchField value={search} onChange={setSearch} placeholder="Search reminders…" />
          </div>
          <FilterSelect
            value={status}
            onChange={setStatus}
            allLabel="All statuses"
            options={[
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <FilterSelect
            value={type}
            onChange={setType}
            allLabel="All types"
            options={[
              { value: "meeting", label: "Meeting" },
              { value: "call", label: "Call" },
              { value: "send_proposal", label: "Send Proposal" },
              { value: "send_quotation", label: "Send Quotation" },
              { value: "whatsapp_followup", label: "WhatsApp" },
              { value: "payment_followup", label: "Payment" },
              { value: "general_task", label: "Other" },
            ]}
          />
        </div>
        <ReminderList
          reminders={paged.items}
          empty="No reminders match these filters."
          onEdit={(r) => {
            setEditing(r);
            setDefaults(undefined);
            setDialogOpen(true);
          }}
          onScheduleNext={openScheduleNext}
        />
        <ListPagination
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <div className="mt-6 surface-panel shadow-card p-5">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-4 w-4 text-primary" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Google Calendar</p>
            <p className="mt-1">
              Optional. Connect Google to sync meetings. CRM reminders always save even if Calendar is
              unavailable.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ReminderIntegrations />
        </div>
      </div>

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reminder={editing}
        defaults={defaults}
      />
    </div>
  );
}

function BucketCard({
  title,
  count,
  reminders,
  onEdit,
  onScheduleNext,
}: {
  title: string;
  count: number;
  reminders: Reminder[];
  onEdit: (r: Reminder) => void;
  onScheduleNext: (r: Reminder) => void;
}) {
  return (
    <div className="surface-panel shadow-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="mt-2 max-h-64 overflow-y-auto">
        <ReminderList
          reminders={reminders.slice(0, 8)}
          empty={`No ${title.toLowerCase()} items.`}
          onEdit={onEdit}
          onScheduleNext={onScheduleNext}
          compact
        />
      </div>
    </div>
  );
}
