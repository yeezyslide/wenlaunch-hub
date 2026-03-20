import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
});

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  paid: z.boolean().optional(),
});

const deleteSchema = z.object({
  id: z.string(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestones = await prisma.paymentMilestone.findMany({
    where: { projectId: id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(milestones);
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
  const maxPos = await prisma.paymentMilestone.aggregate({
    where: { projectId: id },
    _max: { position: true },
  });
  const milestone = await prisma.paymentMilestone.create({
    data: {
      name: parsed.data.name,
      amount: parsed.data.amount,
      projectId: id,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
  return NextResponse.json(milestone, { status: 201 });
}

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
  const milestone = await prisma.paymentMilestone.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
      ...(parsed.data.paid !== undefined && { paid: parsed.data.paid }),
    },
  });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
  return NextResponse.json(milestone);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await prisma.paymentMilestone.delete({ where: { id: parsed.data.id } });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
