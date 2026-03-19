"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface TranscriptsSectionProps {
  projectId: string;
  initialContent: string;
}

export function TranscriptsSection({
  projectId,
  initialContent,
}: TranscriptsSectionProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcripts: content }),
    });
    if (res.ok) {
      toast.success("Transcripts saved");
      setDirty(false);
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Transcripts</h2>
        {dirty && (
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setDirty(true);
        }}
        onBlur={() => {
          if (dirty) handleSave();
        }}
        placeholder="Paste project transcripts here..."
        rows={8}
        className="font-mono text-[13px] rounded-xl border-border/50 bg-muted/30 focus:bg-white transition-colors"
      />
    </div>
  );
}
