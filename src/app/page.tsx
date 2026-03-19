import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    include: { _count: { select: { tasks: true } } },
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
      {projects.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground/60">
          <p className="text-[17px] font-medium mb-1">No projects yet</p>
          <p className="text-[14px]">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
