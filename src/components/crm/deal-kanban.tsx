"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { DEAL_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pencil, Calendar } from "lucide-react";
import { DealForm } from "./deal-form";

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: Date | string | null;
  notes: string | null;
  clientId: string;
  projectId: string | null;
  position: number;
  client: { id: string; name: string; company: string | null; avatarUrl: string | null };
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

export function DealKanban({
  deals: initialDeals,
  clients,
}: {
  deals: Deal[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingScroll = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const columns = DEAL_STAGES.map((stage) => {
    const stageDeals = deals
      .filter((d) => d.stage === stage)
      .sort((a, b) => a.position - b.position);
    const total = stageDeals.reduce((s, d) => s + d.value, 0);
    return { id: stage, title: stage, deals: stageDeals, total };
  });

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const newStage = destination.droppableId;
      setDeals((prev) =>
        prev.map((d) => (d.id === draggableId ? { ...d, stage: newStage } : d))
      );

      await fetch(`/api/deals/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, position: destination.index }),
      });
      router.refresh();
    },
    [router]
  );

  function handleMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    if ((e.target as HTMLElement).closest("[data-rfd-draggable-id]")) return;
    isDraggingScroll.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDraggingScroll.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }
  function handleMouseUp() {
    isDraggingScroll.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "";
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex gap-4 overflow-x-auto pb-6 -mx-8 px-8 scrollbar-hide select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col shrink-0 w-[280px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 truncate">
                  {column.title}
                </h3>
                {column.deals.length > 0 && (
                  <span className="text-[10px] font-semibold text-muted-foreground/40 bg-muted/40 rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                    {column.deals.length}
                  </span>
                )}
              </div>
              {column.total > 0 && (
                <span className="text-[11px] font-semibold text-muted-foreground/50">
                  {formatCurrency(column.total)}
                </span>
              )}
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-1 rounded-2xl bg-muted/20 p-2 space-y-2 min-h-[180px] transition-all duration-200",
                    snapshot.isDraggingOver && "bg-accent/30 ring-2 ring-accent/50"
                  )}
                >
                  {column.deals.map((deal, index) => {
                    const dealForEdit = {
                      ...deal,
                      expectedCloseDate:
                        deal.expectedCloseDate instanceof Date
                          ? deal.expectedCloseDate.toISOString()
                          : deal.expectedCloseDate,
                    };
                    return (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "rounded-xl border border-border/40 bg-card p-3 transition-all duration-200 group/card cursor-grab active:cursor-grabbing relative",
                              snapshot.isDragging &&
                                "shadow-2xl shadow-black/15 rotate-[2deg] scale-[1.03] border-border"
                            )}
                          >
                            <DealForm
                              deal={dealForEdit}
                              clients={clients}
                              trigger={
                                <button
                                  className="absolute top-2 right-2 h-6 w-6 rounded-md bg-accent/60 hover:bg-accent flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all z-10"
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </button>
                              }
                            />
                            <p className="text-[13px] font-semibold text-foreground/90 leading-snug pr-6 mb-1">
                              {deal.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 mb-2 truncate">
                              {deal.client.name}
                              {deal.client.company ? ` · ${deal.client.company}` : ""}
                            </p>
                            <div className="flex items-center justify-between">
                              {deal.value > 0 ? (
                                <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(deal.value)}
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/30">—</span>
                              )}
                              {deal.expectedCloseDate && (
                                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                            {deal.projectId && (
                              <span className="absolute bottom-1.5 right-2 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                ● project
                              </span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
