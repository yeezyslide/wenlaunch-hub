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
import { MEMBER_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface MemberFormProps {
  member?: { id: string; name: string; email: string | null; color: string };
  trigger?: React.ReactElement;
}

export function MemberForm({ member, trigger }: MemberFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [color, setColor] = useState(member?.color ?? MEMBER_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!member;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const url = isEdit ? `/api/team-members/${member.id}` : "/api/team-members";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), color }),
    });

    if (res.ok) {
      toast.success(isEdit ? "Member updated" : "Member added");
      setOpen(false);
      if (!isEdit) {
        setName("");
        setEmail("");
        setColor(MEMBER_COLORS[0]);
      }
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Member" : "Add Team Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === c && "ring-2 ring-white ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Add Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
