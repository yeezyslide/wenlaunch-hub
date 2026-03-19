import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaskDetail } from "@/components/tasks/task-detail";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: { assignee: true, project: true },
  });

  if (!task) notFound();

  const [projects, members] = await Promise.all([
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.teamMember.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <TaskDetail
      task={{
        ...task,
        dueDate: task.dueDate?.toISOString() ?? null,
      }}
      projects={projects}
      members={members}
    />
  );
}
