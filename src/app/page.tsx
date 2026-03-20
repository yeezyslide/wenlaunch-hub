import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectTable } from "@/components/projects/project-table";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = typeof params.status === "string" ? params.status : undefined;
  const tagFilter = typeof params.tag === "string" ? params.tag : undefined;
  const view = typeof params.view === "string" ? params.view : "grid";

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;
  if (tagFilter) where.tags = { contains: tagFilter };

  const projects = await prisma.project.findMany({
    where,
    include: {
      _count: { select: { tasks: true } },
      milestones: { select: { amount: true, paid: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Projects</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">Your web design projects</p>
        </div>
        <ProjectForm />
      </div>
      <div className="mb-5">
        <Suspense>
          <ProjectFilters />
        </Suspense>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground/60">
          <p className="text-[17px] font-medium mb-1">No projects yet</p>
          <p className="text-[14px]">Create your first project to get started.</p>
        </div>
      ) : view === "table" ? (
        <ProjectTable projects={projects} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
