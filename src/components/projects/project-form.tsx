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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUSES, PROJECT_TAGS, TAG_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus, Upload, X, ImageIcon } from "lucide-react";

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    logoUrl: string | null;
    figmaLink: string | null;
    status: string;
    tags: string;
  };
  trigger?: React.ReactElement;
}

export function ProjectForm({ project, trigger }: ProjectFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(project?.imageUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(project?.logoUrl ?? "");
  const [logoPreview, setLogoPreview] = useState(project?.logoUrl ?? "");
  const [figmaLink, setFigmaLink] = useState(project?.figmaLink ?? "");
  const [status, setStatus] = useState(project?.status ?? "Waiting to Start");
  const [tags, setTags] = useState<string[]>(
    project?.tags ? project.tags.split(",").filter(Boolean) : []
  );

  const isEdit = !!project;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();
      setImageUrl(url);
      setImagePreview(url);
      toast.success("Image uploaded");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Upload failed");
      setImagePreview(imageUrl);
    }
    setUploading(false);
  }

  function removeImage() {
    setImageUrl("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }

    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    setUploadingLogo(true);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setLogoUrl(url);
      setLogoPreview(url);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Upload failed");
      setLogoPreview(logoUrl);
    }
    setUploadingLogo(false);
  }

  function removeLogo() {
    setLogoUrl("");
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const url = isEdit ? `/api/projects/${project.id}` : "/api/projects";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        logoUrl: logoUrl.trim(),
        figmaLink: figmaLink.trim(),
        tags: tags.join(","),
        status,
      }),
    });

    if (res.ok) {
      toast.success(isEdit ? "Project updated" : "Project created");
      setOpen(false);
      if (!isEdit) {
        setName("");
        setDescription("");
        setImageUrl("");
        setImagePreview("");
        setLogoUrl("");
        setLogoPreview("");
        setFigmaLink("");
        setTags([]);
        setStatus("Waiting to Start");
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
              New Project
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Web Design Project"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project description..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Project Image</Label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-muted/30">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <p className="text-[13px] font-medium text-muted-foreground">Uploading...</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-border hover:border-muted-foreground/40 bg-muted/20 hover:bg-muted/40 transition-all duration-150 aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-muted-foreground/80">
                    Click to upload
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            <Label>Project Logo</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="h-14 w-14 rounded-xl border border-dashed border-border hover:border-muted-foreground/40 bg-muted/20 hover:bg-muted/40 flex items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-muted-foreground/60">
                  {logoPreview ? "Click to change" : "Upload a logo for the sidebar"}
                </p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-[11px] text-destructive hover:text-destructive/80 mt-0.5"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_TAGS.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags(
                        selected
                          ? tags.filter((t) => t !== tag)
                          : [...tags, tag]
                      )
                    }
                    className={cn(
                      "text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                      selected
                        ? TAG_COLORS[tag]
                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-figma">Figma Link</Label>
            <Input
              id="project-figma"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              placeholder="https://figma.com/file/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading || uploading || uploadingLogo}>
            {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
