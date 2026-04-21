import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  role: z.string().optional(),
  status: z.string().optional(),
  referralSource: z.string().optional(),
  budgetRange: z.string().optional(),
  projectInterest: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { deals: true, projects: true } },
      deals: { select: { value: true, stage: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const client = await prisma.client.create({
    data: {
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      company: d.company || null,
      website: d.website || null,
      role: d.role || null,
      status: d.status || "Lead",
      referralSource: d.referralSource || null,
      budgetRange: d.budgetRange || null,
      projectInterest: d.projectInterest || "",
      description: d.description || null,
      notes: d.notes || null,
      tags: d.tags || "",
      avatarUrl: d.avatarUrl || null,
    },
  });
  revalidatePath("/crm");
  revalidatePath("/crm/clients");
  return NextResponse.json(client, { status: 201 });
}
