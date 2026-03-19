import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskForm } from "@/components/tasks/task-form";
import { AllTasksKanban } from "@/components/tasks/all-tasks-kanban";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const projectId = typeof params.projectId === "string" ? params.projectId : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const assigneeId = typeof params.assigneeId === "string" ? params.assigneeId : undefined;
  const dateFilter = typeof params.date === "string" ? params.date : undefined;
  const view = typeof params.view === "string" ? params.view : "kanban";

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;

  const now = new Date();
  if (dateFilter === "today") {
    where.dueDate = { gte: startOfDay(now), lte: endOfDay(now) };
  } else if (dateFilter === "week") {
    where.dueDate = { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) };
  } else if (dateFilter === "overdue") {
    where.dueDate = { lt: startOfDay(now) };
    where.status = { not: "Done" };
  } else if (dateFilter === "none") {
    where.dueDate = null;
  }

  const [tasks, projects, members] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignee: true, project: true },
      orderBy: [{ dueDate: "asc" }, { position: "asc" }],
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.teamMember.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serializedTasks = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">All Tasks</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Tasks across all projects
          </p>
        </div>
        {projects.length > 0 && (
          <TaskForm projects={projects} members={members} />
        )}
      </div>
      <div className="mb-4">
        <Suspense>
          <TaskFilters projects={projects} members={members} />
        </Suspense>
      </div>
      {view === "kanban" ? (
        <AllTasksKanban tasks={serializedTasks} projects={projects} members={members} />
      ) : (
        <TaskTable tasks={serializedTasks} projects={projects} members={members} />
      )}
    </div>
  );
}
