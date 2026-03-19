"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { PROJECT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { ProjectForm } from "./project-form";
import { TagBadge } from "./tag-badge";

interface Project {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  status: string;
  tags: string;
  figmaLink: string | null;
  _count: { tasks: number };
}

interface ProjectKanbanProps {
  projects: Project[];
}

export function ProjectKanban({ projects: initialProjects }: ProjectKanbanProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingScroll = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const columns = PROJECT_STATUSES.map((status) => ({
    id: status,
    title: status,
    projects: projects.filter((p) => p.status === status),
  }));

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const newStatus = destination.droppableId;
      setProjects(projects.map((p) =>
        p.id === draggableId ? { ...p, status: newStatus } : p
      ));

      await fetch(`/api/projects/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    },
    [projects, router]
  );

  // Drag-to-scroll handlers
  function handleMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    // Only start scroll-drag on the background, not on cards
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
          <div key={column.id} className="flex flex-col shrink-0 w-[260px]">
            <div className="flex items-center gap-2 mb-3 px-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 truncate">
                {column.title}
              </h3>
              {column.projects.length > 0 && (
                <span className="text-[10px] font-semibold text-muted-foreground/40 bg-muted/40 rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                  {column.projects.length}
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
                  {column.projects.map((project, index) => {
                    const tags = project.tags ? project.tags.split(",").filter(Boolean) : [];
                    return (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "rounded-2xl border border-border/40 bg-card overflow-hidden transition-all duration-200 group/card cursor-grab active:cursor-grabbing relative",
                              snapshot.isDragging && "shadow-2xl shadow-black/15 rotate-[2deg] scale-[1.03] border-border"
                            )}
                          >
                            <ProjectForm
                              project={project}
                              trigger={
                                <button
                                  className="absolute top-2.5 right-2.5 h-7 w-7 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/50 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all z-10"
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <Pencil className="h-3 w-3 text-white" />
                                </button>
                              }
                            />
                            <Link href={`/projects/${project.id}`} onMouseDown={(e) => e.stopPropagation()}>
                              {project.imageUrl ? (
                                <div className="aspect-[16/9] bg-muted/50 overflow-hidden">
                                  <img
                                    src={project.imageUrl}
                                    alt={project.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-[16/9] bg-gradient-to-br from-blue-500/8 via-indigo-500/8 to-violet-500/8 flex items-center justify-center">
                                  <span className="text-3xl font-semibold text-muted-foreground/20">
                                    {project.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </Link>
                            <div className="p-3.5 space-y-2">
                              <Link
                                href={`/projects/${project.id}`}
                                className="text-[13px] font-semibold leading-snug text-foreground/90 hover:text-foreground truncate block"
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                {project.name}
                              </Link>
                              {tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {tags.map((tag) => (
                                    <TagBadge key={tag} tag={tag} />
                                  ))}
                                </div>
                              )}
                              <p className="text-[11px] text-muted-foreground/50 font-medium">
                                {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
                              </p>
                            </div>
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
