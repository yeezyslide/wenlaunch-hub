"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TASK_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LayoutList, Columns3 } from "lucide-react";

interface TaskFiltersProps {
  projects: { id: string; name: string }[];
  members: { id: string; name: string }[];
}

export function TaskFilters({ projects, members }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "kanban";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/tasks?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={searchParams.get("projectId") ?? "all"}
        onValueChange={(v) => v && updateFilter("projectId", v)}
        items={{ all: "All Projects", ...Object.fromEntries(projects.map((p) => [p.id, p.name])) }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => v && updateFilter("status", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {TASK_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("assigneeId") ?? "all"}
        onValueChange={(v) => v && updateFilter("assigneeId", v)}
        items={{ all: "All Assignees", ...Object.fromEntries(members.map((m) => [m.id, m.name])) }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("date") ?? "all"}
        onValueChange={(v) => v && updateFilter("date", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Any Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Date</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="none">No Date</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center rounded-lg border border-border/50 p-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-md",
            view === "table" && "bg-accent shadow-sm"
          )}
          onClick={() => updateFilter("view", "table")}
        >
          <LayoutList className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-md",
            view === "kanban" && "bg-accent shadow-sm"
          )}
          onClick={() => updateFilter("view", "kanban")}
        >
          <Columns3 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
