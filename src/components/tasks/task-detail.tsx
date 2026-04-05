"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichEditor } from "@/components/ui/rich-editor";
import { Separator } from "@/components/ui/separator";
import { TASK_STATUSES, TASK_PRIORITIES, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { format } from "date-fns";

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    assigneeId: string | null;
    projectId: string;
    assignee: { id: string; name: string; color: string; avatarUrl: string | null } | null;
    project: { id: string; name: string };
  };
  projects: { id: string; name: string }[];
  members: { id: string; name: string; color: string; avatarUrl: string | null }[];
}

export function TaskDetail({ task, projects, members }: TaskDetailProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? String(task.dueDate).split("T")[0] : ""
  );
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "none");
  const [projectId, setProjectId] = useState(task.projectId);
  const [dirty, setDirty] = useState(false);

  const markDirty = useCallback(() => setDirty(true), []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description || null,
        status,
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId === "none" ? null : assigneeId,
        projectId,
      }),
    });
    if (res.ok) {
      toast.success("Task saved");
      setDirty(false);
      router.refresh();
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Task deleted");
      router.push("/tasks");
      router.refresh();
    }
  }

  const assignee = members.find((m) => m.id === assigneeId);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex-1" />
        {dirty && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            className="w-full text-[24px] font-semibold tracking-[-0.02em] bg-transparent outline-none mb-4 text-foreground/95"
            placeholder="Task title"
          />

          <RichEditor
            content={description}
            onChange={(html) => { setDescription(html); markDirty(); }}
            placeholder="Add description, checklists, notes..."
          />
        </div>

        {/* Sidebar */}
        <div className="w-[240px] shrink-0 space-y-5">
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Status
              </label>
              <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); markDirty(); } }}>
                <SelectTrigger className="h-8 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => { if (v) { setPriority(v); markDirty(); } }}>
                <SelectTrigger className="h-8 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Project
              </label>
              <Select
                value={projectId}
                onValueChange={(v) => { if (v) { setProjectId(v); markDirty(); } }}
                items={Object.fromEntries(projects.map((p) => [p.id, p.name]))}
              >
                <SelectTrigger className="h-8 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); markDirty(); }}
                className="h-8 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Assignee
              </label>
              <Select
                value={assigneeId}
                onValueChange={(v) => { if (v) { setAssigneeId(v); markDirty(); } }}
                items={{ none: "Unassigned", ...Object.fromEntries(members.map((m) => [m.id, m.name])) }}
              >
                <SelectTrigger className="h-8 text-[13px]">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assignee && (
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white font-semibold overflow-hidden"
                    style={{ backgroundColor: assignee.avatarUrl ? undefined : assignee.color }}
                  >
                    {assignee.avatarUrl ? (
                      <img src={assignee.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      assignee.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-[13px] font-medium">{assignee.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
