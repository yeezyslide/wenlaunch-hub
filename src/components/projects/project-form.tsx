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
import { PROJECT_STATUSES } from "@/lib/constants";
import { Plus } from "lucide-react";

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    figmaLink: string | null;
    status: string;
  };
  trigger?: React.ReactElement;
}

export function ProjectForm({ project, trigger }: ProjectFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [figmaLink, setFigmaLink] = useState(project?.figmaLink ?? "");
  const [status, setStatus] = useState(project?.status ?? "Active");

  const isEdit = !!project;

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
        figmaLink: figmaLink.trim(),
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
        setFigmaLink("");
        setStatus("Active");
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
            <Label htmlFor="project-image">Image URL</Label>
            <Input
              id="project-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
