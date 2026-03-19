"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUSES, TAG_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { ProjectForm } from "./project-form";

interface Project {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-8 px-8">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col shrink-0 w-[240px]">
            <div className="flex items-center gap-2 mb-3 px-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 truncate">
                {column.title}
              </h3>
              {column.projects.length > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground/40 bg-muted/50 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
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
                    "flex-1 rounded-xl bg-muted/30 p-1.5 space-y-1.5 min-h-[160px] transition-colors duration-150",
                    snapshot.isDraggingOver && "bg-accent/40"
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
                              "rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-150 group/card cursor-grab active:cursor-grabbing relative",
                              snapshot.isDragging && "shadow-xl shadow-black/10 rotate-[1deg] scale-[1.02]"
                            )}
                          >
                            <ProjectForm
                              project={project}
                              trigger={
                                <button
                                  className="absolute top-2.5 right-2.5 h-6 w-6 rounded-md bg-black/30 hover:bg-black/50 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <Pencil className="h-3 w-3 text-white" />
                                </button>
                              }
                            />
                            {project.imageUrl ? (
                              <div className="aspect-[16/10] bg-muted/50 overflow-hidden">
                                <img
                                  src={project.imageUrl}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="aspect-[16/10] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-muted-foreground/25">
                                  {project.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="p-3.5 space-y-2">
                              <p className="text-[13px] font-semibold leading-snug text-foreground/90 truncate">
                                {project.name}
                              </p>
                              {tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={cn(
                                        "text-[9px] font-medium px-1.5 py-0.5 rounded-full border",
                                        TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"
                                      )}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-[11px] text-muted-foreground/60 font-medium">
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
