import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const dealSchema = z.object({
  title: z.string().min(1),
  clientId: z.string().min(1),
  stage: z.string().optional(),
  value: z.number().nonnegative().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  projectId: z.string().optional().nullable(),
});

export async function GET() {
  const deals = await prisma.deal.findMany({
    include: { client: true, project: { select: { id: true, name: true } } },
    orderBy: [{ stage: "asc" }, { position: "asc" }],
  });
  return NextResponse.json(deals);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = dealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const lastInStage = await prisma.deal.findFirst({
    where: { stage: d.stage || "Lead" },
    orderBy: { position: "desc" },
  });

  const deal = await prisma.deal.create({
    data: {
      title: d.title,
      clientId: d.clientId,
      stage: d.stage || "Lead",
      value: d.value ?? 0,
      probability: d.probability ?? 0,
      expectedCloseDate: d.expectedCloseDate ? new Date(d.expectedCloseDate) : null,
      notes: d.notes || null,
      projectId: d.projectId || null,
      position: lastInStage ? lastInStage.position + 1 : 0,
    },
    include: { client: true },
  });
  revalidatePath("/crm");
  return NextResponse.json(deal, { status: 201 });
}
