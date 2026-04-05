"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRIORITY_COLORS, TASK_STATUS_COLORS } from "@/lib/constants";
import { cn, parseLocalDate } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  assignee: { id: string; name: string; color: string; avatarUrl: string | null } | null;
  project: { id: string; name: string };
}

interface TaskTableProps {
  tasks: Task[];
  projects: { id: string; name: string }[];
  members: { id: string; name: string; color: string }[];
}

type SortKey = "title" | "project" | "status" | "priority" | "dueDate" | "assignee";

const PRIORITY_ORDER: Record<string, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function TaskTable({ tasks, projects, members }: TaskTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "project":
        cmp = a.project.name.localeCompare(b.project.name);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "priority":
        cmp = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
        break;
      case "dueDate": {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = da - db;
        break;
      }
      case "assignee":
        cmp = (a.assignee?.name ?? "zzz").localeCompare(b.assignee?.name ?? "zzz");
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  function SortHeader({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) {
    return (
      <TableHead
        className="cursor-pointer hover:text-foreground select-none"
        onClick={() => handleSort(sortKeyName)}
      >
        {label} {sortKey === sortKeyName && (sortAsc ? "\u2191" : "\u2193")}
      </TableHead>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground/60">
        <p className="text-[15px] font-medium mb-1">No tasks found</p>
        <p className="text-[13px]">Create tasks from project pages.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortHeader label="Title" sortKeyName="title" />
          <SortHeader label="Project" sortKeyName="project" />
          <SortHeader label="Status" sortKeyName="status" />
          <SortHeader label="Priority" sortKeyName="priority" />
          <SortHeader label="Due Date" sortKeyName="dueDate" />
          <SortHeader label="Assignee" sortKeyName="assignee" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((task) => {
          const overdue =
            task.dueDate &&
            task.status !== "Done" &&
            isPast(parseLocalDate(task.dueDate)) &&
            !isToday(parseLocalDate(task.dueDate));
          return (
                <TableRow
                  key={task.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/30",
                    overdue && "border-l-2 border-l-red-500"
                  )}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.project.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs", TASK_STATUS_COLORS[task.status]?.bg, TASK_STATUS_COLORS[task.status]?.text)}>
                      <div className={cn("h-1.5 w-1.5 rounded-full mr-1", TASK_STATUS_COLORS[task.status]?.dot)} />
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", PRIORITY_COLORS[task.priority])}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm",
                      overdue && "text-red-500 font-medium"
                    )}
                  >
                    {task.dueDate
                      ? format(parseLocalDate(task.dueDate), "MMM d, yyyy")
                      : "\u2014"}
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] text-white font-medium overflow-hidden"
                          style={{ backgroundColor: task.assignee.avatarUrl ? undefined : task.assignee.color }}
                        >
                          {task.assignee.avatarUrl ? (
                            <img src={task.assignee.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            task.assignee.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">\u2014</span>
                    )}
                  </TableCell>
                </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
