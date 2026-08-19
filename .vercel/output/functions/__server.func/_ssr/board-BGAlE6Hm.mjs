import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as useDroppable, i as useDraggable, n as DragOverlay, o as useSensor, r as PointerSensor, s as useSensors, t as DndContext } from "../_libs/@dnd-kit/core+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCrmAuth } from "./router-CL8vSWs-.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { O as Building2, f as Search, g as Mail, m as Phone, p as Plus, u as SlidersHorizontal } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { c as initials, d as updateContact, l as profilesQuery, n as columnsQuery, o as displayName, r as contactsQuery } from "./crm-TMob2vJe.mjs";
import { n as CallLeadButton, r as ContactDialog } from "./ContactDialog-lVsgtKX-.mjs";
import { t as ImportContactsButton } from "./ImportContactsButton-Cwgm3tuB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-BGAlE6Hm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE = 25;
function KanbanBoard({ columns, contacts, profiles, onOpenContact }) {
	const queryClient = useQueryClient();
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [limits, setLimits] = (0, import_react.useState)({});
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	const profileMap = (0, import_react.useMemo)(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = {};
		for (const c of columns) map[c.id] = [];
		for (const contact of contacts) if (contact.column_id && map[contact.column_id]) map[contact.column_id].push(contact);
		return map;
	}, [columns, contacts]);
	const move = useMutation({
		mutationFn: async ({ contact, columnId }) => {
			await updateContact({ data: {
				id: contact.id,
				column_id: columnId
			} });
		},
		onMutate: async ({ contact, columnId }) => {
			await queryClient.cancelQueries({ queryKey: ["contacts"] });
			const prev = queryClient.getQueryData(["contacts"]);
			queryClient.setQueryData(["contacts"], (old) => (old ?? []).map((c) => c.id === contact.id ? {
				...c,
				column_id: columnId
			} : c));
			return { prev };
		},
		onError: (err, _vars, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(["contacts"], ctx.prev);
			toast.error(err.message || "Could not move card");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
		}
	});
	function onDragStart(e) {
		setActiveId(String(e.active.id));
	}
	function onDragEnd(e) {
		setActiveId(null);
		const overId = e.over?.id ? String(e.over.id) : null;
		if (!overId) return;
		const contact = contacts.find((c) => c.id === String(e.active.id));
		if (!contact || contact.column_id === overId) return;
		move.mutate({
			contact,
			columnId: overId
		});
	}
	const activeContact = contacts.find((c) => c.id === activeId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
		sensors,
		onDragStart,
		onDragEnd,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "scrollbar-slim flex h-[calc(100vh-8.5rem)] gap-4 overflow-x-auto px-4 pb-4 sm:px-6",
			children: columns.map((column) => {
				const items = grouped[column.id] ?? [];
				const limit = limits[column.id] ?? PAGE;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ColumnLane, {
					column,
					count: items.length,
					isDragging: !!activeId,
					children: [
						items.slice(0, limit).map((contact) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraggableCard, {
							contact,
							assignee: contact.assigned_to ? profileMap[contact.assigned_to] : null,
							onOpen: () => onOpenContact(contact)
						}, contact.id)),
						items.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "w-full text-xs text-muted-foreground",
							onClick: () => setLimits((l) => ({
								...l,
								[column.id]: limit + PAGE
							})),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }),
								"Show ",
								Math.min(PAGE, items.length - limit),
								" more"
							]
						}),
						items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground",
							children: "Drop cards here"
						})
					]
				}, column.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, { children: activeContact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardBody, {
			contact: activeContact,
			assignee: activeContact.assigned_to ? profileMap[activeContact.assigned_to] : null,
			dragging: true
		}) : null })]
	});
}
function ColumnLane({ column, count, children, isDragging }) {
	const { setNodeRef, isOver } = useDroppable({ id: column.id });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		className: cn("surface-panel flex w-[290px] shrink-0 flex-col transition-colors", isOver && "border-primary/60 bg-accent/50", isDragging && !isOver && "opacity-90"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border px-3 py-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold tracking-tight",
					children: column.name
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground",
				children: count
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "scrollbar-slim flex flex-1 flex-col gap-2 overflow-y-auto p-2",
			children
		})]
	});
}
function DraggableCard({ contact, assignee, onOpen }) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: contact.id });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: setNodeRef,
		...listeners,
		...attributes,
		onClick: onOpen,
		className: cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardBody, {
			contact,
			assignee
		})
	});
}
function CardBody({ contact, assignee, dragging }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("shadow-card rounded-lg border border-border bg-card p-3 transition-shadow hover:border-primary/40", dragging && "shadow-lift rotate-2"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-medium text-card-foreground",
				children: contact.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1.5 space-y-1 text-xs text-muted-foreground",
				children: [
					contact.company && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 truncate",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3" }), contact.company]
					}),
					contact.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center justify-between gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex min-w-0 items-center gap-1.5 truncate",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: contact.phone
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallLeadButton, {
							contact,
							compact: true
						})]
					}),
					contact.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 truncate",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }), contact.email]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2.5 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: (contact.tags ?? []).slice(0, 2).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground",
						children: tag
					}, tag))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					title: displayName(assignee),
					className: cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", assignee ? "bg-primary text-primary-foreground" : "border border-dashed border-border text-muted-foreground"),
					children: assignee ? initials(displayName(assignee)) : "—"
				})]
			})
		]
	});
}
function BoardPage() {
	const { isAdmin } = useCrmAuth();
	const { data: columns = [] } = useQuery(columnsQuery);
	const { data: contacts = [], isLoading } = useQuery(contactsQuery);
	const { data: profiles = [] } = useQuery(profilesQuery);
	const [search, setSearch] = (0, import_react.useState)("");
	const [assignee, setAssignee] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		let list = contacts.filter((c) => {
			if (assignee === "unassigned" && c.assigned_to) return false;
			if (assignee !== "all" && assignee !== "unassigned" && c.assigned_to !== assignee) return false;
			if (!q) return true;
			return [
				c.name,
				c.company,
				c.phone,
				c.email
			].filter(Boolean).some((v) => v.toLowerCase().includes(q));
		});
		list = [...list].sort((a, b) => sort === "newest" ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at));
		return list;
	}, [
		contacts,
		search,
		assignee,
		sort
	]);
	const live = selected ? contacts.find((c) => c.id === selected.id) ?? selected : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 px-4 py-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-[220px] flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search name, company, phone or email…",
							className: "pl-9"
						})]
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: assignee,
						onValueChange: setAssignee,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-[190px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "mr-1.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All assignees"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "unassigned",
								children: "Unassigned"
							}),
							profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.id,
								children: displayName(p)
							}, p.id))
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: sort,
						onValueChange: (v) => setSort(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[140px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "newest",
							children: "Newest first"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "oldest",
							children: "Oldest first"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [filtered.length, " cards"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportContactsButton, {})
				]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-6 text-sm text-muted-foreground",
				children: "Loading board…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
				columns,
				contacts: filtered,
				profiles,
				onOpenContact: setSelected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactDialog, {
				contact: live,
				columns,
				profiles,
				open: !!selected,
				onOpenChange: (o) => !o && setSelected(null)
			})
		]
	});
}
//#endregion
export { BoardPage as component };
