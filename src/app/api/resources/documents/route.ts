import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  folderId: z.string().min(1),
  content: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxPos = await prisma.resourceDocument.aggregate({
    where: { folderId: parsed.data.folderId },
    _max: { position: true },
  });

  const doc = await prisma.resourceDocument.create({
    data: {
      title: parsed.data.title,
      folderId: parsed.data.folderId,
      content: parsed.data.content || null,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  return NextResponse.json(doc, { status: 201 });
}
