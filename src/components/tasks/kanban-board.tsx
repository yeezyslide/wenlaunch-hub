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
import { TASK_STATUSES, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TaskForm } from "./task-form";
import { format } from "date-fns";
import { Calendar, CheckSquare } from "lucide-react";

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
  checklist?: { id: string; completed: boolean }[];
}

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  members: { id: string; name: string; color: string }[];
}

export function KanbanBoard({ tasks: initialTasks, projectId, members }: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);

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

      const task = tasks.find((t) => t.id === draggableId);
      if (!task) return;

      const newStatus = destination.droppableId;
      const updatedTasks = tasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus, position: destination.index } : t
      );
      setTasks(updatedTasks);

      await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          position: destination.index,
        }),
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
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                          className={cn(
                            "rounded-xl border border-border/50 bg-card p-3.5 transition-all duration-150",
                            snapshot.isDragging && "shadow-xl shadow-black/10 rotate-[1deg] scale-[1.02]"
                          )}
                        >
                          <TaskForm
                            projectId={projectId}
                            members={members}
                            task={{
                              ...task,
                              dueDate: task.dueDate,
                            }}
                            trigger={
                              <button className="w-full text-left space-y-2.5">
                                <p className="text-[13px] font-medium leading-snug text-foreground/90">
                                  {task.title}
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
                                  {task.checklist && task.checklist.length > 0 && (
                                    <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                                      <CheckSquare className="h-3 w-3" />
                                      {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(task.dueDate), "MMM d")}
                                    </span>
                                  )}
                                </div>
                                {task.assignee && (
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="h-[18px] w-[18px] rounded-full flex items-center justify-center text-[9px] text-white font-semibold overflow-hidden"
                                      style={{
                                        backgroundColor: task.assignee.avatarUrl ? undefined : task.assignee.color,
                                      }}
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
                              </button>
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="mt-1.5">
              <TaskForm
                projectId={projectId}
                members={members}
                trigger={
                  <button className="w-full text-[12px] font-medium text-muted-foreground/50 hover:text-muted-foreground py-2 rounded-xl hover:bg-muted/40 transition-all duration-150">
                    + Add task
                  </button>
                }
              />
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
