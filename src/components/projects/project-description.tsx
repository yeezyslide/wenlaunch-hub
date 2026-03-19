"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RichEditor } from "@/components/ui/rich-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Save, Pencil } from "lucide-react";

interface ProjectDescriptionProps {
  projectId: string;
  initialContent: string;
}

export function ProjectDescription({ projectId, initialContent }: ProjectDescriptionProps) {
  const [content, setContent] = useState(initialContent);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const hasContent = content && content !== "" && content !== "<p></p>";

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: content }),
    });
    if (res.ok) {
      toast.success("Description saved");
      setDirty(false);
      setEditing(false);
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-foreground/90 hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground/50 transition-transform duration-200",
              !expanded && "-rotate-90"
            )}
          />
          Description
          {!hasContent && <span className="text-[12px] font-normal text-muted-foreground/40 ml-1">(empty)</span>}
        </button>
        <div className="flex items-center gap-2">
          {expanded && !editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {editing && dirty && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
          {editing && (
            <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setContent(initialContent); setDirty(false); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      {expanded && (
        editing ? (
          <RichEditor
            content={content}
            onChange={(html) => { setContent(html); setDirty(true); }}
            placeholder="Add project description, notes, checklists..."
          />
        ) : hasContent ? (
          <div
            className="prose prose-sm max-w-none text-[14px] leading-relaxed text-foreground/80 px-1 tiptap"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-[13px] text-muted-foreground/40 px-1">
            No description yet. Click Edit to add one.
          </p>
        )
      )}
    </div>
  );
}
