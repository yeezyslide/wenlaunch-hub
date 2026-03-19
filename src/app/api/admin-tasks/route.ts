import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  text: z.string().min(1),
  priority: z.string().optional(),
});

export async function GET() {
  const tasks = await prisma.adminTask.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const task = await prisma.adminTask.create({
    data: {
      text: parsed.data.text,
      priority: parsed.data.priority,
    },
  });
  revalidatePath("/admin-tasks");
  return NextResponse.json(task, { status: 201 });
}
