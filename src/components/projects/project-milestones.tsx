"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Check, Trash2, DollarSign, CircleDot } from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  position: number;
}

interface ProjectMilestonesProps {
  projectId: string;
  milestones: Milestone[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectMilestones({ projectId, milestones: initial }: ProjectMilestonesProps) {
  const router = useRouter();
  const [milestones, setMilestones] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const total = milestones.reduce((sum, m) => sum + m.amount, 0);
  const collected = milestones.filter((m) => m.paid).reduce((sum, m) => sum + m.amount, 0);
  const progress = total > 0 ? (collected / total) * 100 : 0;

  async function addMilestone() {
    if (!newName.trim() || !newAmount) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) return;

    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), amount }),
    });
    if (res.ok) {
      const milestone = await res.json();
      setMilestones([...milestones, milestone]);
      setNewName("");
      setNewAmount("");
      setAdding(false);
      toast.success("Milestone added");
    }
  }

  async function togglePaid(milestone: Milestone) {
    const newPaid = !milestone.paid;
    setMilestones(milestones.map((m) => (m.id === milestone.id ? { ...m, paid: newPaid } : m)));
    await fetch(`/api/projects/${projectId}/milestones`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: milestone.id, paid: newPaid }),
    });
    router.refresh();
  }

  async function deleteMilestone(id: string) {
    setMilestones(milestones.filter((m) => m.id !== id));
    await fetch(`/api/projects/${projectId}/milestones`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Milestone removed");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Payments</h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Milestone
        </Button>
      </div>

      {/* Summary bar */}
      {milestones.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[11px] text-muted-foreground/50 font-medium uppercase tracking-wider">Collected</p>
                <p className="text-[18px] font-semibold text-emerald-600">{formatCurrency(collected)}</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div>
                <p className="text-[11px] text-muted-foreground/50 font-medium uppercase tracking-wider">Total</p>
                <p className="text-[18px] font-semibold text-foreground/80">{formatCurrency(total)}</p>
              </div>
              {total > collected && (
                <>
                  <div className="h-8 w-px bg-border/50" />
                  <div>
                    <p className="text-[11px] text-muted-foreground/50 font-medium uppercase tracking-wider">Remaining</p>
                    <p className="text-[18px] font-semibold text-muted-foreground/60">{formatCurrency(total - collected)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="flex items-end gap-2 mb-4 p-3 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex-1 space-y-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Milestone name (e.g. Design Deposit)"
              className="h-8 text-[13px]"
              autoFocus
            />
          </div>
          <div className="w-32">
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Amount"
              className="h-8 text-[13px]"
              onKeyDown={(e) => { if (e.key === "Enter") addMilestone(); }}
            />
          </div>
          <Button size="sm" onClick={addMilestone} disabled={!newName.trim() || !newAmount}>
            Add
          </Button>
        </div>
      )}

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <p className="text-[13px] text-muted-foreground/40 px-1">
          No payment milestones yet. Add milestones to track project payments.
        </p>
      ) : (
        <div className="space-y-1">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/20 transition-colors group/ms"
            >
              <button
                onClick={() => togglePaid(milestone)}
                className={cn(
                  "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                  milestone.paid
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-border/60 hover:border-emerald-400"
                )}
              >
                {milestone.paid && <Check className="h-3 w-3 text-white" />}
              </button>
              <span className={cn(
                "flex-1 text-[13px] font-medium",
                milestone.paid && "line-through text-muted-foreground/40"
              )}>
                {milestone.name}
              </span>
              <span className={cn(
                "text-[14px] font-semibold tabular-nums",
                milestone.paid ? "text-emerald-600" : "text-foreground/70"
              )}>
                {formatCurrency(milestone.amount)}
              </span>
              <button
                onClick={() => deleteMilestone(milestone.id)}
                className="opacity-0 group-hover/ms:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
