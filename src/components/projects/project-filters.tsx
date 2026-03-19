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
import { PROJECT_STATUSES, PROJECT_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LayoutGrid, Columns3 } from "lucide-react";

export function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => v && updateFilter("status", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {PROJECT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("tag") ?? "all"}
        onValueChange={(v) => v && updateFilter("tag", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {PROJECT_TAGS.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center rounded-lg border border-border/50 p-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-md",
            view === "grid" && "bg-accent shadow-sm"
          )}
          onClick={() => updateFilter("view", "grid")}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
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
