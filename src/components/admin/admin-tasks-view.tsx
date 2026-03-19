"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, TASK_PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus, X, Check, Trash2 } from "lucide-react";

interface AdminTask {
  id: string;
  text: string;
  completed: boolean;
  priority: string;
  createdAt: string;
}

export function AdminTasksView({ tasks: initialTasks }: { tasks: AdminTask[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  async function addTask() {
    if (!newText.trim()) return;
    const res = await fetch("/api/admin-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim(), priority: newPriority }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks([task, ...tasks]);
      setNewText("");
      setNewPriority("Medium");
      inputRef.current?.focus();
    }
  }

  async function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));
    await fetch(`/api/admin-tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newCompleted }),
    });
  }

  async function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
    await fetch(`/api/admin-tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
  }

  async function updateText(id: string, text: string) {
    if (!text.trim()) return;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text } : t)));
    await fetch(`/api/admin-tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });
  }

  return (
    <div className="max-w-2xl">
      {/* Add task */}
      <div className="flex items-center gap-2 mb-6">
        <Input
          ref={inputRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
          placeholder="Add a task..."
          className="flex-1 h-10 text-[14px]"
        />
        <div className="flex items-center gap-1 shrink-0">
          {TASK_PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setNewPriority(p)}
              className={cn(
                "text-[10px] font-medium px-2 py-1 rounded-full border transition-all",
                newPriority === p
                  ? PRIORITY_COLORS[p] + " border-current/20"
                  : "text-muted-foreground/40 border-transparent hover:text-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={addTask}
          disabled={!newText.trim()}
          className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 disabled:opacity-30 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Pending tasks */}
      {pending.length === 0 && completed.length === 0 && (
        <div className="text-center py-16 text-muted-foreground/40">
          <p className="text-[15px] font-medium mb-1">No tasks yet</p>
          <p className="text-[13px]">Add your first admin task above.</p>
        </div>
      )}

      <div className="space-y-1">
        {pending.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 group rounded-xl px-3 py-2.5 hover:bg-muted/20 transition-colors"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="h-5 w-5 rounded-md border-2 border-border/60 hover:border-blue-400 flex items-center justify-center shrink-0 transition-all"
            >
            </button>
            <input
              type="text"
              defaultValue={task.text}
              key={task.id + task.text}
              onBlur={(e) => updateText(task.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="flex-1 bg-transparent text-[14px] outline-none"
            />
            <Badge
              variant="secondary"
              className={cn("text-[10px] rounded-full px-2 py-0", PRIORITY_COLORS[task.priority])}
            >
              {task.priority}
            </Badge>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-6">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-2 px-3">
            Completed ({completed.length})
          </p>
          <div className="space-y-0.5">
            {completed.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 group rounded-xl px-3 py-2 hover:bg-muted/20 transition-colors"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="h-5 w-5 rounded-md bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center shrink-0"
                >
                  <Check className="h-3 w-3 text-white" />
                </button>
                <span className="flex-1 text-[14px] text-muted-foreground/40 line-through">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
