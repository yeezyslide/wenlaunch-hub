import { prisma } from "@/lib/prisma";
import { DealKanban } from "@/components/crm/deal-kanban";
import { DealForm } from "@/components/crm/deal-form";
import { ClientForm } from "@/components/crm/client-form";
import Link from "next/link";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CrmPipelinePage() {
  const [deals, clients] = await Promise.all([
    prisma.deal.findMany({
      include: { client: { select: { id: true, name: true, company: true, avatarUrl: true } } },
      orderBy: [{ stage: "asc" }, { position: "asc" }],
    }),
    prisma.client.findMany({
      select: { id: true, name: true, company: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPipeline = deals
    .filter((d) => d.stage !== "Won" && d.stage !== "Lost")
    .reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter((d) => d.stage === "Won").reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">CRM Pipeline</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Active pipeline:{" "}
            <span className="font-medium text-foreground">${totalPipeline.toLocaleString()}</span>
            {" · "}
            Won:{" "}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              ${wonValue.toLocaleString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/crm/clients"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 hover:bg-accent transition-colors"
          >
            <Users className="h-4 w-4" />
            Clients
          </Link>
          <ClientForm variant="ghost" />
          <DealForm clients={clients} />
        </div>
      </div>
      <DealKanban deals={deals} clients={clients} />
    </div>
  );
}
