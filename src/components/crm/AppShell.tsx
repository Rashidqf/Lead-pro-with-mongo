import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CircleDollarSign,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Users,
  Contact as ContactIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import { signOut as signOutFn } from "@/lib/auth.functions";
import { useTheme } from "@/lib/theme";
import { initials } from "@/lib/crm";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/board", label: "Board", icon: KanbanSquare, adminOnly: false },
  { to: "/contacts", label: "Contacts", icon: ContactIcon, adminOnly: false },
  { to: "/projects", label: "Projects", icon: Briefcase, adminOnly: false },
  { to: "/finance", label: "Finance", icon: CircleDollarSign, adminOnly: false },
  { to: "/users", label: "Team", icon: Users, adminOnly: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { email, isAdmin, role } = useCrmAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutFn();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground">
              LP
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              LeadPilot
            </span>
          </Link>

          <nav className="ml-2 flex items-center gap-1 overflow-x-auto scrollbar-slim">
            {links
              .filter((l) => !l.adminOnly || isAdmin)
              .map((l) => {
                const active = pathname.startsWith(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <l.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{l.label}</span>
                  </Link>
                );
              })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden items-center gap-2 rounded-full border border-border px-2 py-1 md:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {initials(email ?? "?")}
              </span>
              <span className="max-w-[160px] truncate text-xs text-muted-foreground">{email}</span>
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                {role ?? "…"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}