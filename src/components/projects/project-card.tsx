import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status: string;
    _count: { tasks: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:border-border hover:-translate-y-0.5">
        <div className="aspect-[16/10] bg-muted/50 relative overflow-hidden">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 flex items-center justify-center">
              <span className="text-4xl font-semibold text-muted-foreground/25">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground/90 group-hover:text-foreground transition-colors">
              {project.name}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 text-[11px] font-medium rounded-full px-2.5 py-0.5",
                STATUS_COLORS[project.status]
              )}
            >
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
          <p className="text-[12px] text-muted-foreground/70 mt-4 font-medium">
            {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
