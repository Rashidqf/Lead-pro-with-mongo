import { Link, useRouterState } from "@tanstack/react-router";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATE_RANGE_LABELS, type DateRange, type DateRangePreset } from "@/lib/finance";
import { cn } from "@/lib/utils";

const PRESETS: DateRangePreset[] = [
  "today",
  "last7",
  "last30",
  "thisMonth",
  "prevMonth",
  "custom",
];

export function DateRangeSelector({
  value,
  onChange,
  className,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}) {
  function setPreset(preset: DateRangePreset) {
    if (preset === "custom") {
      onChange({ ...value, preset });
      return;
    }
    onChange({
      preset,
      from: format(new Date(), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    });
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={value.preset === preset ? "default" : "outline"}
            onClick={() => setPreset(preset)}
          >
            {DATE_RANGE_LABELS[preset]}
          </Button>
        ))}
      </div>
      {value.preset === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-auto"
            value={value.from.slice(0, 10)}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            className="w-auto"
            value={value.to.slice(0, 10)}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

export function useDefaultDateRange(): DateRange {
  return {
    preset: "last30",
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  };
}

export function MetricCard({
  label,
  value,
  sub,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  negative?: boolean;
}) {
  return (
    <div className="surface-panel shadow-card p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <p
        className={cn(
          "mt-3 text-3xl font-semibold tracking-tight",
          negative && "text-destructive",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function FinanceSubNav() {
  const links = [
    { to: "/finance", label: "Overview", exact: true },
    { to: "/finance/transactions", label: "Transactions", exact: false },
    { to: "/finance/income", label: "Income", exact: false },
    { to: "/finance/expenses", label: "Expenses", exact: false },
    { to: "/finance/outstanding", label: "Outstanding", exact: false },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {links.map((l) => (
        <FinanceNavLink key={l.to} to={l.to} exact={l.exact}>
          {l.label}
        </FinanceNavLink>
      ))}
    </nav>
  );
}

function FinanceNavLink({
  to,
  exact,
  children,
}: {
  to: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = exact ? pathname === to : pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export function CustomerSelect({
  contacts,
  value,
  onChange,
  placeholder = "Select customer",
}: {
  contacts: { id: string; name: string; phone: string | null }[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {contacts.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
            {c.phone ? ` · ${c.phone}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ProjectSelect({
  projects,
  contactId,
  value,
  onChange,
  allowNone,
}: {
  projects: { id: string; contact_id: string; name: string }[];
  contactId?: string;
  value: string;
  onChange: (id: string) => void;
  allowNone?: boolean;
}) {
  const filtered = contactId ? projects.filter((p) => p.contact_id === contactId) : projects;
  return (
    <Select value={value || (allowNone ? "none" : undefined)} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value="none">No project</SelectItem>}
        {filtered.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
