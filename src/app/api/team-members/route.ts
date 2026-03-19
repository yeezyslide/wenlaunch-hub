import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  color: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export async function GET() {
  const members = await prisma.teamMember.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const member = await prisma.teamMember.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      color: parsed.data.color,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });
  return NextResponse.json(member, { status: 201 });
}
