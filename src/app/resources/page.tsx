import { prisma } from "@/lib/prisma";
import { ResourcesView } from "@/components/resources/resources-view";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const folders = await prisma.resourceFolder.findMany({
    include: {
      documents: { orderBy: { position: "asc" } },
      _count: { select: { documents: true } },
    },
    orderBy: { position: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Resources</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Documents and guides for your team
          </p>
        </div>
      </div>
      <ResourcesView folders={folders} />
    </div>
  );
}
