"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RichEditor } from "@/components/ui/rich-editor";
import { ADMIN_TASK_STATUSES, ADMIN_STATUS_COLORS, PRIORITY_COLORS, TASK_PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check, LayoutList, Columns3 } from "lucide-react";

interface AdminTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  createdAt: string;
}

export function AdminTasksView({ tasks: initialTasks }: { tasks: AdminTask[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "kanban";
  const [tasks, setTasks] = useState(initialTasks);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [editTask, setEditTask] = useState<AdminTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDirty, setEditDirty] = useState(false);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`/admin-tasks?${params.toString()}`);
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/admin-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), priority: newPriority }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks([...tasks, { ...task, createdAt: task.createdAt }]);
      setNewTitle("");
      setNewPriority("Medium");
      setAddOpen(false);
      toast.success("Task added");
    }
  }

  async function updateTask(id: string, data: Partial<AdminTask>) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...data } : t)));
    await fetch(`/api/admin-tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
    await fetch(`/api/admin-tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
  }

  function openEdit(task: AdminTask) {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setEditDirty(false);
  }

  async function saveEdit() {
    if (!editTask || !editTitle.trim()) return;
    updateTask(editTask.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || null,
    });
    setEditTask(null);
    toast.success("Saved");
  }

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, destination } = result;
      if (!destination) return;
      const newStatus = destination.droppableId;
      setTasks(tasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus, position: destination.index } : t
      ));
      await fetch(`/api/admin-tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, position: destination.index }),
      });
    },
    [tasks]
  );

  const columns = ADMIN_TASK_STATUSES.map((status) => ({
    id: status,
    tasks: tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position),
  }));

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-5">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Task
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Admin Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                autoFocus
              />
              <div className="flex gap-1.5">
                {TASK_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={cn(
                      "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all",
                      newPriority === p
                        ? PRIORITY_COLORS[p] + " border-current/20"
                        : "text-muted-foreground/40 border-border/50 hover:text-muted-foreground"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button onClick={addTask} className="w-full" disabled={!newTitle.trim()}>
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex-1" />
        <div className="flex items-center rounded-lg border border-border/50 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-md", view === "kanban" && "bg-accent shadow-sm")}
            onClick={() => setView("kanban")}
          >
            <Columns3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-md", view === "table" && "bg-accent shadow-sm")}
            onClick={() => setView("table")}
          >
            <LayoutList className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit dialog with rich text */}
      <Dialog open={!!editTask} onOpenChange={(open) => {
        if (!open) {
          if (editDirty) saveEdit();
          else setEditTask(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => { setEditTitle(e.target.value); setEditDirty(true); }}
              placeholder="Task title"
            />
            <RichEditor
              content={editDesc}
              onChange={(html) => { setEditDesc(html); setEditDirty(true); }}
              placeholder="Add notes, checklists, details..."
            />
            <div className="flex gap-2">
              <Button onClick={saveEdit} className="flex-1">Save</Button>
              {editTask && (
                <Button variant="destructive" onClick={() => { deleteTask(editTask.id); setEditTask(null); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kanban View */}
      {view === "kanban" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn("h-2 w-2 rounded-full", ADMIN_STATUS_COLORS[column.id]?.dot)} />
                  <h3 className={cn("text-[12px] font-semibold uppercase tracking-wider", ADMIN_STATUS_COLORS[column.id]?.text)}>
                    {column.id}
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
                              onMouseDown={(e) => { mouseDownPos.current = { x: e.clientX, y: e.clientY }; }}
                              onClick={(e) => {
                                if (!mouseDownPos.current) return;
                                const dx = Math.abs(e.clientX - mouseDownPos.current.x);
                                const dy = Math.abs(e.clientY - mouseDownPos.current.y);
                                if (dx < 5 && dy < 5) openEdit(task);
                                mouseDownPos.current = null;
                              }}
                              className={cn(
                                "rounded-xl border border-border/50 bg-card p-3 transition-all duration-150 cursor-pointer relative",
                                snapshot.isDragging && "shadow-xl shadow-black/10 rotate-[1deg] scale-[1.02] cursor-grabbing"
                              )}
                            >
                              <p className="text-[13px] font-medium leading-snug text-foreground/90">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-[11px] text-muted-foreground/50 mt-1 line-clamp-2">{task.description.replace(/<[^>]*>/g, "")}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-2">
                                <Badge
                                  variant="secondary"
                                  className={cn("text-[10px] font-medium rounded-full px-2 py-0", PRIORITY_COLORS[task.priority])}
                                >
                                  {task.priority}
                                </Badge>
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
      ) : (
        /* Table View */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="group/row">
                <TableCell>
                  {task.status !== "Done" ? (
                    <button
                      onClick={() => updateTask(task.id, { status: "Done" })}
                      className="h-5 w-5 rounded-md border-2 border-border/60 hover:border-emerald-400 hover:bg-emerald-50 flex items-center justify-center transition-all"
                    />
                  ) : (
                    <button
                      onClick={() => updateTask(task.id, { status: "To Do" })}
                      className="h-5 w-5 rounded-md bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openEdit(task)}
                    className={cn(
                      "text-[13px] font-medium text-left hover:text-foreground transition-colors",
                      task.status === "Done" && "line-through text-muted-foreground/40"
                    )}
                  >
                    {task.title}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[10px] rounded-full px-2 py-0", ADMIN_STATUS_COLORS[task.status]?.bg, ADMIN_STATUS_COLORS[task.status]?.text)}>
                    <div className={cn("h-1.5 w-1.5 rounded-full mr-1", ADMIN_STATUS_COLORS[task.status]?.dot)} />
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[10px] rounded-full px-2 py-0", PRIORITY_COLORS[task.priority])}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover/row:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
