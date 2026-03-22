"use client";

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
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TagBadge } from "./tag-badge";

interface Project {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  status: string;
  tags: string;
  _count: { tasks: number };
  milestones?: { amount: number; paid: boolean }[];
}

function formatCompact(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

export function ProjectTable({
  projects,
  priorityRanks,
}: {
  projects: Project[];
  priorityRanks: Record<string, number>;
}) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Tasks</TableHead>
          <TableHead className="text-right">Payments</TableHead>
          <TableHead className="text-right">Pending</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const tags = project.tags ? project.tags.split(",").filter(Boolean) : [];
          const total = project.milestones?.reduce((s, m) => s + m.amount, 0) ?? 0;
          const collected = project.milestones?.filter((m) => m.paid).reduce((s, m) => s + m.amount, 0) ?? 0;
          const pendingAmount = total - collected;
          const rank = priorityRanks[project.id];

          return (
            <TableRow
              key={project.id}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <TableCell>
                {rank !== undefined ? (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-md bg-amber-500 text-[10px] font-bold text-white">
                    {rank}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground/25">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {project.logoUrl ? (
                    <img
                      src={project.logoUrl}
                      alt=""
                      className="h-8 w-8 rounded-lg object-contain shrink-0"
                    />
                  ) : project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt=""
                      className="h-8 w-8 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center shrink-0">
                      <span className="text-[13px] font-semibold text-muted-foreground/25">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-[13px] font-semibold">{project.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-medium rounded-full px-2 py-0",
                    STATUS_COLORS[project.status]
                  )}
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                {tags.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground/30 text-[12px]">—</span>
                )}
              </TableCell>
              <TableCell className="text-right text-[12px] text-muted-foreground/60 font-medium">
                {project._count.tasks}
              </TableCell>
              <TableCell className="text-right">
                {total === 0 ? (
                  <span className="text-[12px] text-muted-foreground/30">—</span>
                ) : (
                  <span className={cn(
                    "text-[12px] font-medium",
                    collected === total ? "text-emerald-500" : "text-muted-foreground/60"
                  )}>
                    {formatCompact(collected)}/{formatCompact(total)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {pendingAmount > 0 ? (
                  <span className="text-[12px] font-semibold text-amber-600">
                    {formatCompact(pendingAmount)}
                  </span>
                ) : (
                  <span className="text-[12px] text-emerald-500 font-medium">Paid</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
