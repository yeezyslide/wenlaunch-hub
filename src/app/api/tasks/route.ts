import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1),
  assigneeId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assigneeId");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: true, project: true },
    orderBy: [{ dueDate: "asc" }, { position: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxPosition = await prisma.task.aggregate({
    where: {
      projectId: parsed.data.projectId,
      status: parsed.data.status || "To Do",
    },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      projectId: parsed.data.projectId,
      assigneeId: parsed.data.assigneeId || null,
      position: (maxPosition._max.position ?? -1) + 1,
    },
    include: { assignee: true },
  });
  return NextResponse.json(task, { status: 201 });
}
