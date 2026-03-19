import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "@/components/projects/project-header";
import { TranscriptsSection } from "@/components/projects/transcripts-section";
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
    },
  });

  if (!project) notFound();

  const members = await prisma.teamMember.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <ProjectHeader project={project} />
      <Separator className="opacity-50" />
      <TranscriptsSection
        projectId={project.id}
        initialContent={project.transcripts ?? ""}
      />
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
