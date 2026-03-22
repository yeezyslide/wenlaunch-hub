"use client";

import { Briefcase, DollarSign, CheckCircle2 } from "lucide-react";

interface PipelineProject {
  name: string;
  pending: number;
  total: number;
}

interface ProjectStatsProps {
  activeProjects: number;
  totalRevenue: number;
  collected: number;
  pending: number;
  pipeline: PipelineProject[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompact(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

export function ProjectStats({
  activeProjects,
  totalRevenue,
  collected,
  pending,
  pipeline,
}: ProjectStatsProps) {
  const collectionRate =
    totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 mb-6">
      {/* Pending — hero card */}
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-amber-600/70" />
          <span className="text-[11px] font-semibold text-amber-700/70 uppercase tracking-wider">
            Pending Revenue
          </span>
        </div>
        <p className="text-[32px] font-bold tracking-[-0.03em] text-amber-700">
          {formatCurrency(pending)}
        </p>
        {pipeline.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {pipeline.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-600/50 w-4 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-amber-900/70 truncate">
                      {p.name}
                    </span>
                    <span className="text-[12px] font-semibold text-amber-700 shrink-0">
                      {formatCompact(p.pending)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-amber-200/60 mt-0.5">
                    <div
                      className="h-full rounded-full bg-amber-500/70"
                      style={{
                        width: `${p.total > 0 ? Math.round(((p.total - p.pending) / p.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secondary stats */}
      <div className="flex lg:flex-col gap-3 lg:w-[200px]">
        <div className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Active
            </span>
          </div>
          <p className="text-[20px] font-semibold tracking-[-0.02em]">
            {activeProjects}
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </span>
          </div>
          <p className="text-[20px] font-semibold tracking-[-0.02em]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Collected
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-emerald-600">
              {formatCurrency(collected)}
            </p>
            {totalRevenue > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                {collectionRate}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
