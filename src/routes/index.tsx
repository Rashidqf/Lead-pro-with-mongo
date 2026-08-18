import { createFileRoute, Link } from "@tanstack/react-router";
import { KanbanSquare, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadPilot — Lead & Contact Pipeline CRM" },
      {
        name: "description",
        content:
          "LeadPilot is a Kanban CRM for lead management: import contacts, assign them to your team, and track every deal from lead to closed.",
      },
      { property: "og:title", content: "LeadPilot — Lead & Contact Pipeline CRM" },
      {
        property: "og:description",
        content: "A Kanban CRM for importing, assigning and tracking leads across your team.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: KanbanSquare,
    title: "Trello-style pipeline",
    body: "Drag leads across Leads, Contacted, Follow Up, Interested and Closed. Every move saves instantly.",
  },
  {
    icon: Users,
    title: "Assign to your team",
    body: "Search any teammate and hand off a card. They see it immediately — nobody else does.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Admins manage everything. Users only ever see the contacts assigned to them.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground">
            LP
          </span>
          <span className="font-semibold tracking-tight">LeadPilot</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <section className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            CRM · Lead management · Kanban
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Every lead, in the right column, with the right owner.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Import your contact list, drag cards through your pipeline, and give each teammate
            exactly the leads they should see — nothing more.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Open your workspace</Link>
            </Button>
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="surface-panel shadow-card p-6">
              <f.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-base font-semibold tracking-tight">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
