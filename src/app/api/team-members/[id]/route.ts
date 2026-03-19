import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  color: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
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
  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      ...parsed.data,
      email: parsed.data.email === "" ? null : parsed.data.email,
    },
  });
  return NextResponse.json(member);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
