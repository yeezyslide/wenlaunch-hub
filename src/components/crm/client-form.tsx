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
import {
  CLIENT_STATUSES,
  REFERRAL_SOURCES,
  BUDGET_RANGES,
  PROJECT_INTERESTS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface ClientLike {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  role: string | null;
  status: string;
  referralSource: string | null;
  budgetRange: string | null;
  projectInterest: string;
  description: string | null;
  notes: string | null;
  tags: string;
}

interface Props {
  client?: ClientLike;
  trigger?: React.ReactElement;
  variant?: "default" | "ghost";
}

export function ClientForm({ client, trigger, variant = "default" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [company, setCompany] = useState(client?.company ?? "");
  const [website, setWebsite] = useState(client?.website ?? "");
  const [role, setRole] = useState(client?.role ?? "");
  const [status, setStatus] = useState(client?.status ?? "Lead");
  const [referralSource, setReferralSource] = useState(client?.referralSource ?? "");
  const [budgetRange, setBudgetRange] = useState(client?.budgetRange ?? "");
  const [interests, setInterests] = useState<string[]>(
    client?.projectInterest ? client.projectInterest.split(",").filter(Boolean) : []
  );
  const [description, setDescription] = useState(client?.description ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  const isEdit = !!client;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const url = isEdit ? `/api/clients/${client.id}` : "/api/clients";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        website: website.trim(),
        role: role.trim(),
        status,
        referralSource,
        budgetRange,
        projectInterest: interests.join(","),
        description: description.trim(),
        notes: notes.trim(),
      }),
    });

    if (res.ok) {
      toast.success(isEdit ? "Client updated" : "Client added");
      setOpen(false);
      if (!isEdit) {
        setName(""); setEmail(""); setPhone(""); setCompany(""); setWebsite("");
        setRole(""); setReferralSource(""); setBudgetRange(""); setInterests([]);
        setDescription(""); setNotes(""); setStatus("Lead");
      }
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  const defaultTrigger =
    variant === "ghost" ? (
      <Button variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        New Client
      </Button>
    ) : (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        {isEdit ? "Edit" : "New Client"}
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? defaultTrigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name *</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-company">Company</Label>
              <Input id="c-company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-website">Website</Label>
              <Input id="c-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-role">Role / Title</Label>
              <Input id="c-role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referral Source</Label>
              <Select value={referralSource} onValueChange={(v) => v && setReferralSource(v)}>
                <SelectTrigger><SelectValue placeholder="Where from?" /></SelectTrigger>
                <SelectContent>
                  {REFERRAL_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Select value={budgetRange} onValueChange={(v) => v && setBudgetRange(v)}>
                <SelectTrigger><SelectValue placeholder="Budget" /></SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Interest</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_INTERESTS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() =>
                      setInterests(
                        selected ? interests.filter((i) => i !== interest) : [...interests, interest]
                      )
                    }
                    className={cn(
                      "text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60"
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-desc">Project Description / Goals</Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do they want to build?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-notes">Internal Notes</Label>
            <Textarea
              id="c-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Things to remember..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Client" : "Create Client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
