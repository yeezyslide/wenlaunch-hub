"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Plus, Trash2, Link as LinkIcon, Globe } from "lucide-react";

interface ResourceLink {
  label: string;
  url: string;
}

interface ProjectLinksProps {
  projectId: string;
  initialLinks: string;
  figmaLink: string | null;
}

export function ProjectLinks({ projectId, initialLinks, figmaLink }: ProjectLinksProps) {
  const router = useRouter();
  const [links, setLinks] = useState<ResourceLink[]>(() => {
    try { return JSON.parse(initialLinks); } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  async function saveLinks(updated: ResourceLink[]) {
    setLinks(updated);
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links: JSON.stringify(updated) }),
    });
    router.refresh();
  }

  function addLink() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    saveLinks([...links, { label: newLabel.trim(), url }]);
    setNewLabel("");
    setNewUrl("");
    setAdding(false);
    toast.success("Link added");
  }

  function removeLink(index: number) {
    saveLinks(links.filter((_, i) => i !== index));
    toast.success("Link removed");
  }

  const allLinks: (ResourceLink & { type?: string })[] = [];
  if (figmaLink) {
    allLinks.push({ label: "Figma File", url: figmaLink, type: "figma" });
  }
  allLinks.push(...links);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Resource Links</h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Link
        </Button>
      </div>

      {adding && (
        <div className="flex items-end gap-2 mb-4 p-3 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex-1 space-y-1.5">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Link name"
              className="h-8 text-[13px]"
              autoFocus
            />
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="h-8 text-[13px]"
              onKeyDown={(e) => { if (e.key === "Enter") addLink(); }}
            />
          </div>
          <Button size="sm" onClick={addLink} disabled={!newLabel.trim() || !newUrl.trim()}>
            Add
          </Button>
        </div>
      )}

      {allLinks.length === 0 ? (
        <p className="text-[13px] text-muted-foreground/40 px-1">
          No resource links yet. Add links to important project resources.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-card hover:bg-muted/30 hover:border-border transition-all group/link text-[12px] font-medium text-foreground/70 hover:text-foreground"
            >
              {link.type === "figma" ? (
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 38 57" fill="none"><path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/><path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/><path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/><path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/><path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/></svg>
              ) : (
                <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
              {link.label}
              <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover/link:text-muted-foreground shrink-0" />
              {link.type !== "figma" && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeLink(i - (figmaLink ? 1 : 0)); }}
                  className="h-4 w-4 rounded flex items-center justify-center opacity-0 group-hover/link:opacity-100 text-destructive hover:bg-destructive/10 transition-all shrink-0 -mr-1"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
