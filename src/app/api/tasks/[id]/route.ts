import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().optional(),
  position: z.number().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.dueDate === null) {
    data.dueDate = null;
  } else if (typeof data.dueDate === "string") {
    data.dueDate = new Date(data.dueDate as string);
  } else {
    delete data.dueDate;
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: { assignee: true },
  });
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/");
  return NextResponse.json(task);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
