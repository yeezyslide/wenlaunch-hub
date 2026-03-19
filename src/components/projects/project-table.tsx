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
}

export function ProjectTable({ projects }: { projects: Project[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Tasks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const tags = project.tags ? project.tags.split(",").filter(Boolean) : [];
          return (
            <TableRow
              key={project.id}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
