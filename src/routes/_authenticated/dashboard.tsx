import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CircleDashed, UserCheck, Users2, Contact2 } from "lucide-react";

import {
  activitiesQuery,
  columnsQuery,
  contactsQuery,
  displayName,
  profilesQuery,
} from "@/lib/crm";
import { useCrmAuth } from "@/hooks/use-crm-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LeadPilot CRM" },
      { name: "description", content: "Pipeline overview: contacts, assignments and recent team activity." },
      { property: "og:title", content: "Dashboard — LeadPilot CRM" },
      { property: "og:description", content: "Pipeline overview: contacts, assignments and activity." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { isAdmin } = useCrmAuth();
  const { data: contacts = [] } = useQuery(contactsQuery);
  const { data: columns = [] } = useQuery(columnsQuery);
  const { data: profiles = [] } = useQuery(profilesQuery);
  const { data: activities = [] } = useQuery(activitiesQuery);

  const assigned = contacts.filter((c) => c.assigned_to).length;
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const stats = [
    { label: isAdmin ? "Total contacts" : "My contacts", value: contacts.length, icon: Contact2 },
    ...(isAdmin ? [{ label: "Team members", value: profiles.length, icon: Users2 }] : []),
    { label: "Assigned", value: assigned, icon: UserCheck },
    { label: "Unassigned", value: contacts.length - assigned, icon: CircleDashed },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isAdmin ? "Workspace overview across all leads." : "Overview of the leads assigned to you."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-panel shadow-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-panel shadow-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Contacts per column</h2>
          <ul className="mt-4 space-y-3">
            {columns.map((col) => {
              const count = contacts.filter((c) => c.column_id === col.id).length;
              const pct = contacts.length ? Math.round((count / contacts.length) * 100) : 0;
              return (
                <li key={col.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{col.name}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="bg-gradient-brand h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="surface-panel shadow-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
          {activities.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activities.slice(0, 12).map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate">
                      <span className="font-medium">
                        {displayName(a.user_id ? profileMap[a.user_id] : null)}
                      </span>{" "}
                      {a.action} {a.detail ? `· ${a.detail}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}