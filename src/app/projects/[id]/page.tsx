import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectDescription } from "@/components/projects/project-description";
import { ProjectLinks } from "@/components/projects/project-links";
import { ProjectMilestones } from "@/components/projects/project-milestones";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Separator } from "@/components/ui/separator";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignee: true },
        orderBy: { position: "asc" },
      },
      milestones: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!project) notFound();

  const members = await prisma.teamMember.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <ProjectHeader project={project} />
      <ProjectDescription
        projectId={project.id}
        initialContent={project.description ?? ""}
      />
      <Separator className="opacity-50" />
      <ProjectLinks
        projectId={project.id}
        initialLinks={project.links}
        figmaLink={project.figmaLink}
      />
      <Separator className="opacity-50" />
      <ProjectMilestones projectId={project.id} milestones={project.milestones} />
      <Separator className="opacity-50" />
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] mb-5">Tasks</h2>
        <KanbanBoard
          tasks={project.tasks.map((t) => ({
            ...t,
            dueDate: t.dueDate?.toISOString() ?? null,
          }))}
          projectId={project.id}
          members={members}
        />
      </div>
    </div>
  );
}
