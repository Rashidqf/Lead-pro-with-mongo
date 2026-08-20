import { Link, useRouterState } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Contact as ContactIcon,
  FolderKanban,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_RANGE_LABELS,
  PAGE_SIZE_DEFAULT,
  type DateRange,
  type DateRangePreset,
} from "@/lib/finance";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

const PRESETS: DateRangePreset[] = [
  "allTime",
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
      <Select value={value.preset} onValueChange={(v) => setPreset(v as DateRangePreset)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {DATE_RANGE_LABELS[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    preset: "allTime",
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  };
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-[200px] flex-1", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  allLabel = "All",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  allLabel?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ListPagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  pageSize = PAGE_SIZE_DEFAULT,
}: {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}) {
  if (total === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total}
        <span className="text-muted-foreground/80"> · {pageSize} per page</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** Reset to page 1 whenever filter inputs change. */
export function useResetPage(...deps: unknown[]) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [page, setPage] as const;
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
  placeholder = "Search customer…",
  disabled,
}: {
  contacts: { id: string; name: string; phone: string | null; company?: string | null }[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = contacts.find((c) => c.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="h-9 w-full justify-between text-sm font-normal"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <ContactIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {current ? (
              <span className="truncate">
                {current.name}
                {current.phone ? (
                  <span className="text-muted-foreground"> · {formatPhone(current.phone)}</span>
                ) : null}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name, phone, company…" />
          <CommandList>
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup>
              {contacts.map((c) => (
                <CommandItem
                  key={c.id}
                  value={[c.name, c.phone, c.company, formatPhone(c.phone)].filter(Boolean).join(" ")}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === c.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[formatPhone(c.phone), c.company].filter(Boolean).join(" · ") || "No phone"}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ProjectSelect({
  projects,
  contactId,
  value,
  onChange,
  allowNone,
  disabled,
}: {
  projects: { id: string; contact_id: string; name: string }[];
  contactId?: string;
  value: string;
  onChange: (id: string) => void;
  allowNone?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const filtered = contactId ? projects.filter((p) => p.contact_id === contactId) : projects;
  const current =
    value && value !== "none" ? (filtered.find((p) => p.id === value) ?? null) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled || (!allowNone && filtered.length === 0)}
          className="h-9 w-full justify-between text-sm font-normal"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {current ? (
              <span className="truncate">{current.name}</span>
            ) : value === "none" ? (
              <span className="text-muted-foreground">No project</span>
            ) : (
              <span className="text-muted-foreground">Search project…</span>
            )}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search project…" />
          <CommandList>
            <CommandEmpty>
              {contactId ? "No projects for this customer." : "No projects found."}
            </CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value="no project none"
                  onSelect={() => {
                    onChange("none");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === "none" ? "opacity-100" : "opacity-0",
                    )}
                  />
                  No project
                </CommandItem>
              )}
              {filtered.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === p.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{p.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
