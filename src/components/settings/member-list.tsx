"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MemberForm } from "./member-form";
import { Pencil, Trash2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string | null;
  color: string;
  avatarUrl: string | null;
  _count: { tasks: number };
}

export function MemberList({ members }: { members: Member[] }) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? Their tasks will be unassigned.`)) return;
    const res = await fetch(`/api/team-members/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Member removed");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground/60">
        <p className="text-[15px] font-medium mb-1">No team members yet</p>
        <p className="text-[13px]">Add your first member to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-card/80"
        >
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-[13px] shrink-0 shadow-sm overflow-hidden"
            style={{ backgroundColor: member.avatarUrl ? undefined : member.color }}
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-foreground/90">{member.name}</p>
            {member.email && (
              <p className="text-[12px] text-muted-foreground/60">{member.email}</p>
            )}
          </div>
          <span className="text-[12px] text-muted-foreground/50 font-medium">
            {member._count.tasks} task{member._count.tasks !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-0.5">
            <MemberForm
              member={member}
              trigger={
                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg h-8 w-8"
              onClick={() => handleDelete(member.id, member.name)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
