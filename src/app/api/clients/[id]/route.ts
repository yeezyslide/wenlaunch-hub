import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      deals: { orderBy: { createdAt: "desc" } },
      projects: true,
    },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
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
  const data: Record<string, unknown> = { ...parsed.data };
  for (const k of ["email", "phone", "company", "website", "role", "referralSource", "budgetRange", "description", "notes", "avatarUrl"]) {
    if (data[k] === "") data[k] = null;
  }
  const client = await prisma.client.update({ where: { id }, data });
  revalidatePath("/crm");
  revalidatePath("/crm/clients");
  return NextResponse.json(client);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  revalidatePath("/crm");
  revalidatePath("/crm/clients");
  return NextResponse.json({ success: true });
}
