"use client";

import { Briefcase, DollarSign, Clock, CheckCircle2 } from "lucide-react";

interface ProjectStatsProps {
  activeProjects: number;
  totalRevenue: number;
  collected: number;
  pending: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectStats({
  activeProjects,
  totalRevenue,
  collected,
  pending,
}: ProjectStatsProps) {
  const collectionRate =
    totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="rounded-xl border border-border/50 bg-card px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Active Projects
          </span>
        </div>
        <p className="text-[22px] font-semibold tracking-[-0.02em]">
          {activeProjects}
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Total Revenue
          </span>
        </div>
        <p className="text-[22px] font-semibold tracking-[-0.02em]">
          {formatCurrency(totalRevenue)}
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Collected
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-[22px] font-semibold tracking-[-0.02em] text-emerald-600">
            {formatCurrency(collected)}
          </p>
          {totalRevenue > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {collectionRate}%
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-500/70" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Pending
          </span>
        </div>
        <p className="text-[22px] font-semibold tracking-[-0.02em] text-amber-600">
          {formatCurrency(pending)}
        </p>
      </div>
    </div>
  );
}
