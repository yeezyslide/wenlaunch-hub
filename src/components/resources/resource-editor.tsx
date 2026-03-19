"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/ui/rich-editor";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

interface ResourceEditorProps {
  document: {
    id: string;
    title: string;
    content: string;
    folderId: string;
    folderName: string;
  };
}

export function ResourceEditor({ document: doc }: ResourceEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const markDirty = useCallback(() => setDirty(true), []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/resources/documents/${doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content }),
    });
    if (res.ok) {
      toast.success("Saved");
      setDirty(false);
      router.refresh();
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/resources/documents/${doc.id}`, { method: "DELETE" });
    toast.success("Document deleted");
    router.push("/resources");
    router.refresh();
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/resources")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Resources
        </Button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-[13px] text-muted-foreground">{doc.folderName}</span>
        <div className="flex-1" />
        {dirty && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); markDirty(); }}
        className="w-full text-[28px] font-semibold tracking-[-0.02em] bg-transparent outline-none mb-6 text-foreground/95"
        placeholder="Document title"
      />

      <RichEditor
        content={content}
        onChange={(html) => { setContent(html); markDirty(); }}
        placeholder="Start writing..."
        className="min-h-[400px]"
      />
    </div>
  );
}
