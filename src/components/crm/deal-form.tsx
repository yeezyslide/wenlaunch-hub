"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGES } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";

interface DealLike {
  id: string;
  title: string;
  clientId: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: string | null;
  notes: string | null;
  projectId: string | null;
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

interface Props {
  deal?: DealLike;
  clients: ClientOption[];
  trigger?: React.ReactElement;
  defaultStage?: string;
}

export function DealForm({ deal, clients, trigger, defaultStage }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  const [title, setTitle] = useState(deal?.title ?? "");
  const [clientId, setClientId] = useState(deal?.clientId ?? "");
  const [stage, setStage] = useState(deal?.stage ?? defaultStage ?? "Lead");
  const [value, setValue] = useState<string>(deal?.value ? String(deal.value) : "");
  const [probability, setProbability] = useState<string>(
    deal?.probability !== undefined ? String(deal.probability) : ""
  );
  const [closeDate, setCloseDate] = useState(
    deal?.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(deal?.notes ?? "");

  const isEdit = !!deal;
  const canConvert = isEdit && !deal.projectId && stage === "Won";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    setLoading(true);

    const url = isEdit ? `/api/deals/${deal.id}` : "/api/deals";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        clientId,
        stage,
        value: value ? Number(value) : 0,
        probability: probability ? Number(probability) : 0,
        expectedCloseDate: closeDate || null,
        notes: notes.trim(),
      }),
    });

    if (res.ok) {
      toast.success(isEdit ? "Deal updated" : "Deal created");
      setOpen(false);
      if (!isEdit) {
        setTitle(""); setClientId(""); setStage("Lead"); setValue("");
        setProbability(""); setCloseDate(""); setNotes("");
      }
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  async function handleConvert() {
    if (!isEdit) return;
    setConverting(true);
    const res = await fetch(`/api/deals/${deal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convertToProject: true }),
    });
    if (res.ok) {
      toast.success("Project created from deal");
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Couldn't create project");
    }
    setConverting(false);
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!confirm("Delete this deal?")) return;
    const res = await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deal deleted");
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "New Deal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="d-title">Deal Title *</Label>
            <Input
              id="d-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Acme website redesign"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` — ${c.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => v && setStage(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-value">Value ($)</Label>
              <Input
                id="d-value"
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-prob">Probability (%)</Label>
              <Input
                id="d-prob"
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-close">Expected Close</Label>
              <Input
                id="d-close"
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-notes">Notes</Label>
            <Textarea
              id="d-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {canConvert && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
              <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                This deal is Won. Turn it into an active project?
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleConvert}
                disabled={converting}
              >
                {converting ? "Creating..." : "Convert to Project"}
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Deal" : "Create Deal"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
