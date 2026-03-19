import { prisma } from "@/lib/prisma";
import { AdminTasksView } from "@/components/admin/admin-tasks-view";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const tasks = await prisma.adminTask.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  const serialized = tasks.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Admin Tasks</h1>
        <p className="text-[14px] text-muted-foreground mt-0.5">
          Your studio to-do list
        </p>
      </div>
      <AdminTasksView tasks={serialized} />
    </div>
  );
}
