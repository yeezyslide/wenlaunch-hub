import { prisma } from "@/lib/prisma";
import { ClientTable } from "@/components/crm/client-table";
import { ClientForm } from "@/components/crm/client-form";
import Link from "next/link";
import { Kanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { deals: true, projects: true } },
      deals: { select: { value: true, stage: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Clients</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            {clients.length} total — past and potential
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/crm"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 hover:bg-accent transition-colors"
          >
            <Kanban className="h-4 w-4" />
            Pipeline
          </Link>
          <ClientForm />
        </div>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground/60">
          <p className="text-[17px] font-medium mb-1">No clients yet</p>
          <p className="text-[14px]">Add your first client to get started.</p>
        </div>
      ) : (
        <ClientTable clients={clients} />
      )}
    </div>
  );
}
