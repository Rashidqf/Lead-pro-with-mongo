import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { displayName, type Profile } from "@/lib/crm";

export function AssignUserSelect({
  profiles,
  value,
  onChange,
  disabled,
  className,
}: {
  profiles: Profile[];
  value: string | null;
  onChange: (userId: string | null) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = profiles.find((p) => p.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("h-9 w-full justify-between text-sm font-normal", className)}
        >
          <span className="flex items-center gap-2 truncate">
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
            {current ? displayName(current) : "Unassigned"}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users…" />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="unassigned"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value ? "opacity-0" : "opacity-100")} />
                Unassigned
              </CommandItem>
              {profiles.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.full_name ?? ""} ${p.email ?? ""}`}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === p.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">
                    {displayName(p)}
                    {!p.is_active && (
                      <span className="ml-1 text-xs text-muted-foreground">(inactive)</span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}