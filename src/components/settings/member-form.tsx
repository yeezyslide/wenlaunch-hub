"use client";

import { useState, useRef } from "react";
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
import { Plus, Camera, X } from "lucide-react";

interface MemberFormProps {
  member?: {
    id: string;
    name: string;
    email: string | null;
    color: string;
    avatarUrl: string | null;
  };
  trigger?: React.ReactElement;
}

export function MemberForm({ member, trigger }: MemberFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [color, setColor] = useState(member?.color ?? MEMBER_COLORS[0]);
  const [avatarUrl, setAvatarUrl] = useState(member?.avatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState(member?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = !!member;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setAvatarUrl(url);
      setAvatarPreview(url);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Upload failed");
      setAvatarPreview(avatarUrl);
    }
    setUploading(false);
  }

  function removeAvatar() {
    setAvatarUrl("");
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const url = isEdit ? `/api/team-members/${member.id}` : "/api/team-members";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        color,
        avatarUrl: avatarUrl || null,
      }),
    });

    if (res.ok) {
      toast.success(isEdit ? "Member updated" : "Member added");
      setOpen(false);
      if (!isEdit) {
        setName("");
        setEmail("");
        setColor(MEMBER_COLORS[0]);
        setAvatarUrl("");
        setAvatarPreview("");
      }
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

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
          <div className="flex justify-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-xl cursor-pointer transition-opacity hover:opacity-80 relative"
                style={{ backgroundColor: avatarPreview ? undefined : color }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <p className="text-[10px] text-white font-medium">...</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-full flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center text-xs hover:bg-destructive/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
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
                    color === c &&
                      "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || uploading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Add Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
