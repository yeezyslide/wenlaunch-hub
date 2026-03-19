import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export async function GET() {
  const tasks = await prisma.adminTask.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const maxPos = await prisma.adminTask.aggregate({
    where: { status: parsed.data.status || "To Do" },
    _max: { position: true },
  });
  const task = await prisma.adminTask.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  revalidatePath("/admin-tasks");
  return NextResponse.json(task, { status: 201 });
}
