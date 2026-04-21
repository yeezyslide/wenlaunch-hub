import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  stage: z.string().optional(),
  value: z.number().nonnegative().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  position: z.number().int().optional(),
  projectId: z.string().optional().nullable(),
  convertToProject: z.boolean().optional(),
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

  const { convertToProject, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (data.expectedCloseDate === null || data.expectedCloseDate === "") {
    data.expectedCloseDate = null;
  } else if (typeof data.expectedCloseDate === "string") {
    data.expectedCloseDate = new Date(data.expectedCloseDate);
  }
  if (data.notes === "") data.notes = null;
  if (data.projectId === "") data.projectId = null;

  let deal = await prisma.deal.update({
    where: { id },
    data,
    include: { client: true, project: true },
  });

  if (convertToProject && !deal.projectId) {
    const project = await prisma.project.create({
      data: {
        name: deal.title,
        status: "Waiting to Start",
        clientId: deal.clientId,
      },
    });
    deal = await prisma.deal.update({
      where: { id },
      data: { projectId: project.id, stage: "Won" },
      include: { client: true, project: true },
    });
    await prisma.client.update({
      where: { id: deal.clientId },
      data: { status: "Won" },
    });
    revalidatePath("/");
    revalidatePath("/projects");
  }

  revalidatePath("/crm");
  return NextResponse.json(deal);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.deal.delete({ where: { id } });
  revalidatePath("/crm");
  return NextResponse.json({ success: true });
}
