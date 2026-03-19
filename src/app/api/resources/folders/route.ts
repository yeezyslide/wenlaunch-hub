import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export async function GET() {
  const folders = await prisma.resourceFolder.findMany({
    include: { _count: { select: { documents: true } }, documents: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(folders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxPos = await prisma.resourceFolder.aggregate({ _max: { position: true } });

  const folder = await prisma.resourceFolder.create({
    data: {
      name: parsed.data.name,
      icon: parsed.data.icon || null,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  return NextResponse.json(folder, { status: 201 });
}
