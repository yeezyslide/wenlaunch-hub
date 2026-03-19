import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  text: z.string().min(1),
});

const updateSchema = z.object({
  id: z.string(),
  text: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

const deleteSchema = z.object({
  id: z.string(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await prisma.checklistItem.findMany({
    where: { taskId: id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxPos = await prisma.checklistItem.aggregate({
    where: { taskId: id },
    _max: { position: true },
  });

  const item = await prisma.checklistItem.create({
    data: {
      text: parsed.data.text,
      taskId: id,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.checklistItem.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.text !== undefined && { text: parsed.data.text }),
      ...(parsed.data.completed !== undefined && { completed: parsed.data.completed }),
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.checklistItem.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ success: true });
}
