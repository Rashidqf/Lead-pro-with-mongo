import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, Phone, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateContact } from "@/lib/crm.functions";
import {
  displayName,
  initials,
  type BoardColumn,
  type Contact,
  type Profile,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

const PAGE = 25;

export function KanbanBoard({
  columns,
  contacts,
  profiles,
  onOpenContact,
}: {
  columns: BoardColumn[];
  contacts: Contact[];
  profiles: Profile[];
  onOpenContact: (contact: Contact) => void;
}) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const profileMap = useMemo(
    () => Object.fromEntries(profiles.map((p) => [p.id, p])),
    [profiles],
  );
  const grouped = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    for (const c of columns) map[c.id] = [];
    for (const contact of contacts) {
      if (contact.column_id && map[contact.column_id]) map[contact.column_id].push(contact);
    }
    return map;
  }, [columns, contacts]);

  const move = useMutation({
    mutationFn: async ({ contact, columnId }: { contact: Contact; columnId: string }) => {
      await updateContact({ data: { id: contact.id, column_id: columnId } });
    },
    onMutate: async ({ contact, columnId }) => {
      await queryClient.cancelQueries({ queryKey: ["contacts"] });
      const prev = queryClient.getQueryData<Contact[]>(["contacts"]);
      queryClient.setQueryData<Contact[]>(["contacts"], (old) =>
        (old ?? []).map((c) => (c.id === contact.id ? { ...c, column_id: columnId } : c)),
      );
      return { prev };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["contacts"], ctx.prev);
      toast.error(err.message || "Could not move card");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    const contact = contacts.find((c) => c.id === String(e.active.id));
    if (!contact || contact.column_id === overId) return;
    move.mutate({ contact, columnId: overId });
  }

  const activeContact = contacts.find((c) => c.id === activeId) ?? null;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="scrollbar-slim flex h-[calc(100vh-8.5rem)] gap-4 overflow-x-auto px-4 pb-4 sm:px-6">
        {columns.map((column) => {
          const items = grouped[column.id] ?? [];
          const limit = limits[column.id] ?? PAGE;
          return (
            <ColumnLane
              key={column.id}
              column={column}
              count={items.length}
              isDragging={!!activeId}
            >
              {items.slice(0, limit).map((contact) => (
                <DraggableCard
                  key={contact.id}
                  contact={contact}
                  assignee={contact.assigned_to ? profileMap[contact.assigned_to] : null}
                  onOpen={() => onOpenContact(contact)}
                />
              ))}
              {items.length > limit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setLimits((l) => ({ ...l, [column.id]: limit + PAGE }))}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Show {Math.min(PAGE, items.length - limit)} more
                </Button>
              )}
              {items.length === 0 && (
                <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  Drop cards here
                </p>
              )}
            </ColumnLane>
          );
        })}
      </div>

      <DragOverlay>
        {activeContact ? (
          <CardBody
            contact={activeContact}
            assignee={activeContact.assigned_to ? profileMap[activeContact.assigned_to] : null}
            dragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ColumnLane({
  column,
  count,
  children,
  isDragging,
}: {
  column: BoardColumn;
  count: number;
  children: React.ReactNode;
  isDragging: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "surface-panel flex w-[290px] shrink-0 flex-col transition-colors",
        isOver && "border-primary/60 bg-accent/50",
        isDragging && !isOver && "opacity-90",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold tracking-tight">{column.name}</h3>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
          {count}
        </span>
      </div>
      <div className="scrollbar-slim flex flex-1 flex-col gap-2 overflow-y-auto p-2">{children}</div>
    </div>
  );
}

function DraggableCard({
  contact,
  assignee,
  onOpen,
}: {
  contact: Contact;
  assignee: Profile | null;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: contact.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <CardBody contact={contact} assignee={assignee} />
    </div>
  );
}

function CardBody({
  contact,
  assignee,
  dragging,
}: {
  contact: Contact;
  assignee: Profile | null;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "shadow-card rounded-lg border border-border bg-card p-3 transition-shadow hover:border-primary/40",
        dragging && "shadow-lift rotate-2",
      )}
    >
      <p className="truncate text-sm font-medium text-card-foreground">{contact.name}</p>
      <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
        {contact.company && (
          <p className="flex items-center gap-1.5 truncate">
            <Building2 className="h-3 w-3" />
            {contact.company}
          </p>
        )}
        {contact.phone && (
          <p className="flex items-center gap-1.5 truncate">
            <Phone className="h-3 w-3" />
            {contact.phone}
          </p>
        )}
        {contact.email && (
          <p className="flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3" />
            {contact.email}
          </p>
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(contact.tags ?? []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          title={displayName(assignee)}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
            assignee
              ? "bg-primary text-primary-foreground"
              : "border border-dashed border-border text-muted-foreground",
          )}
        >
          {assignee ? initials(displayName(assignee)) : "—"}
        </span>
      </div>
    </div>
  );
}