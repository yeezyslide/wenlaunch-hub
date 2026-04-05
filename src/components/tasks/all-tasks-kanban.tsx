"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUSES, TASK_STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { cn, parseLocalDate } from "@/lib/utils";
import { TaskForm } from "./task-form";
import { format } from "date-fns";
import { Calendar, Pencil } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  position: number;
  projectId: string;
  assigneeId: string | null;
  assignee: { id: string; name: string; color: string; avatarUrl: string | null } | null;
  project: { id: string; name: string };
}

interface AllTasksKanbanProps {
  tasks: Task[];
  projects: { id: string; name: string }[];
  members: { id: string; name: string; color: string }[];
}

export function AllTasksKanban({ tasks: initialTasks, projects, members }: AllTasksKanbanProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const columns = TASK_STATUSES.map((status) => ({
    id: status,
    title: status,
    tasks: tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position),
  }));

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const newStatus = destination.droppableId;
      setTasks(tasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus, position: destination.index } : t
      ));

      await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, position: destination.index }),
      });
      router.refresh();
    },
    [tasks, router]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-3">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={cn("h-2 w-2 rounded-full", TASK_STATUS_COLORS[column.id]?.dot)} />
              <h3 className={cn("text-[12px] font-semibold uppercase tracking-wider", TASK_STATUS_COLORS[column.id]?.text ?? "text-muted-foreground/70")}>
                {column.title}
              </h3>
              <span className="text-[11px] font-medium text-muted-foreground/40 bg-muted/50 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {column.tasks.length}
              </span>
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-1 rounded-xl bg-muted/30 p-1.5 space-y-1.5 min-h-[200px] transition-colors duration-150",
                    snapshot.isDraggingOver && "bg-accent/40"
                  )}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onMouseDown={(e) => {
                            mouseDownPos.current = { x: e.clientX, y: e.clientY };
                          }}
                          onClick={(e) => {
                            if (!mouseDownPos.current) return;
                            const dx = Math.abs(e.clientX - mouseDownPos.current.x);
                            const dy = Math.abs(e.clientY - mouseDownPos.current.y);
                            if (dx < 5 && dy < 5) {
                              router.push(`/tasks/${task.id}`);
                            }
                            mouseDownPos.current = null;
                          }}
                          className={cn(
                            "rounded-xl border border-border/50 bg-card p-3.5 transition-all duration-150 group/card cursor-pointer relative",
                            snapshot.isDragging && "shadow-xl shadow-black/10 rotate-[1deg] scale-[1.02] cursor-grabbing"
                          )}
                        >
                          <TaskForm
                            projects={projects}
                            members={members}
                            task={{ ...task, dueDate: task.dueDate }}
                            trigger={
                              <button
                                className="absolute top-2.5 right-2.5 h-6 w-6 rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </button>
                            }
                          />
                          <div className="space-y-2">
                            <p className="text-[13px] font-medium leading-snug text-foreground/90 pr-6">
                              {task.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground/50 font-medium">
                              {task.project.name}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] font-medium rounded-full px-2 py-0",
                                  PRIORITY_COLORS[task.priority]
                                )}
                              >
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(parseLocalDate(task.dueDate), "MMM d")}
                                </span>
                              )}
                            </div>
                            {task.assignee && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="h-[18px] w-[18px] rounded-full flex items-center justify-center text-[9px] text-white font-semibold overflow-hidden"
                                  style={{ backgroundColor: task.assignee.avatarUrl ? undefined : task.assignee.color }}
                                >
                                  {task.assignee.avatarUrl ? (
                                    <img src={task.assignee.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    task.assignee.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground/60 font-medium">
                                  {task.assignee.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
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
