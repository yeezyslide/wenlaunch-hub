import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TagBadge } from "./tag-badge";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status: string;
    tags: string;
    _count: { tasks: number };
    milestones?: { amount: number; paid: boolean }[];
  };
  priorityRank?: number;
}

function formatCompact(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

export function ProjectCard({ project, priorityRank }: ProjectCardProps) {
  const tags = project.tags ? project.tags.split(",").filter(Boolean) : [];
  const total = project.milestones?.reduce((s, m) => s + m.amount, 0) ?? 0;
  const collected = project.milestones?.filter((m) => m.paid).reduce((s, m) => s + m.amount, 0) ?? 0;
  const pendingAmount = total - collected;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-black/5 hover:border-border hover:-translate-y-0.5">
        <div className="aspect-[2/1] bg-muted/50 relative overflow-hidden">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 flex items-center justify-center">
              <span className="text-3xl font-semibold text-muted-foreground/20">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {priorityRank !== undefined && (
            <div className="absolute top-2 left-2 h-5 min-w-5 px-1.5 rounded-md bg-amber-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">#{priorityRank}</span>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground/90 group-hover:text-foreground transition-colors truncate">
              {project.name}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 text-[10px] font-medium rounded-full px-2 py-0",
                STATUS_COLORS[project.status]
              )}
            >
              {project.status}
            </Badge>
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[11px] text-muted-foreground/50 font-medium">
              {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
            </p>
            {total > 0 && (
              <p className={cn(
                "text-[11px] font-medium",
                collected === total ? "text-emerald-500" : "text-muted-foreground/40"
              )}>
                {formatCompact(collected)}/{formatCompact(total)}
              </p>
            )}
            {pendingAmount > 0 && (
              <p className="text-[11px] font-semibold text-amber-600 ml-auto">
                {formatCompact(pendingAmount)} pending
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
