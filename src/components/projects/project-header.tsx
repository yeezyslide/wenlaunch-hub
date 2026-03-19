"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "./project-form";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TagBadge } from "./tag-badge";
import { Pencil, Trash2 } from "lucide-react";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    logoUrl: string | null;
    figmaLink: string | null;
    status: string;
    tags: string;
  };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();
  const tags = project.tags ? project.tags.split(",").filter(Boolean) : [];

  async function handleDelete() {
    if (!confirm(`Delete "${project.name}" and all its tasks?`)) return;
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Project deleted");
      router.push("/");
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="flex gap-8 mb-10">
      <div className="flex flex-col gap-3 shrink-0">
        <div className="w-52 h-36 rounded-2xl overflow-hidden bg-muted/50 shadow-sm">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 flex items-center justify-center">
              <span className="text-5xl font-semibold text-muted-foreground/25">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {project.logoUrl && (
          <div className="flex items-center gap-2 px-1">
            <img src={project.logoUrl} alt="" className="h-6 w-6 rounded-md object-contain" />
            <span className="text-[11px] text-muted-foreground/50 font-medium">Logo</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground/95">
              {project.name}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="secondary"
              className={cn(
                "text-[11px] font-medium rounded-full px-2.5 py-0.5 mr-1",
                STATUS_COLORS[project.status]
              )}
            >
              {project.status}
            </Badge>
            <ProjectForm
              project={project}
              trigger={
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {tags.map((tag) => (
              <TagBadge key={tag} tag={tag} size="md" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
