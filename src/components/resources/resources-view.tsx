"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  FolderPlus,
  FilePlus,
  ChevronDown,
  FileText,
  Folder,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  content: string | null;
  position: number;
}

interface FolderWithDocs {
  id: string;
  name: string;
  icon: string | null;
  position: number;
  documents: Document[];
  _count: { documents: number };
}

interface ResourcesViewProps {
  folders: FolderWithDocs[];
}

export function ResourcesView({ folders }: ResourcesViewProps) {
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map((f) => f.id))
  );
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newDocOpen, setNewDocOpen] = useState<string | null>(null);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  function toggleFolder(id: string) {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/resources/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    if (res.ok) {
      toast.success("Folder created");
      setNewFolderName("");
      setNewFolderOpen(false);
      router.refresh();
    }
  }

  async function createDocument(folderId: string) {
    if (!newDocTitle.trim()) return;
    const res = await fetch("/api/resources/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newDocTitle.trim(), folderId }),
    });
    if (res.ok) {
      const doc = await res.json();
      toast.success("Document created");
      setNewDocTitle("");
      setNewDocOpen(null);
      router.push(`/resources/${doc.id}`);
    }
  }

  async function renameFolder(id: string) {
    if (!editFolderName.trim()) return;
    await fetch(`/api/resources/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editFolderName.trim() }),
    });
    setEditingFolder(null);
    router.refresh();
  }

  async function deleteFolder(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its documents?`)) return;
    await fetch(`/api/resources/folders/${id}`, { method: "DELETE" });
    toast.success("Folder deleted");
    router.refresh();
  }

  async function deleteDocument(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/resources/documents/${id}`, { method: "DELETE" });
    toast.success("Document deleted");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {folders.map((folder) => (
        <div key={folder.id} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          {/* Folder header */}
          <div className="flex items-center gap-2 px-4 py-3 hover:bg-muted/20 transition-colors">
            <button
              onClick={() => toggleFolder(folder.id)}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground/50 transition-transform duration-200 shrink-0",
                  !expandedFolders.has(folder.id) && "-rotate-90"
                )}
              />
              <Folder className="h-4 w-4 shrink-0" style={{ color: "#FC4C48" }} />
              {editingFolder === folder.id ? (
                <input
                  type="text"
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  onBlur={() => renameFolder(folder.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameFolder(folder.id);
                    if (e.key === "Escape") setEditingFolder(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="text-[14px] font-semibold bg-transparent outline-none flex-1"
                />
              ) : (
                <span className="text-[14px] font-semibold truncate">{folder.name}</span>
              )}
              <span className="text-[11px] text-muted-foreground/40 font-medium ml-1">
                {folder._count.documents}
              </span>
            </button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 [div:hover>&]:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setNewDocOpen(folder.id)}
              >
                <FilePlus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => {
                  setEditingFolder(folder.id);
                  setEditFolderName(folder.name);
                }}
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => deleteFolder(folder.id, folder.name)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Documents */}
          {expandedFolders.has(folder.id) && (
            <div className="border-t border-border/30">
              {folder.documents.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[13px] text-muted-foreground/50 mb-2">No documents yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[12px]"
                    onClick={() => setNewDocOpen(folder.id)}
                  >
                    <FilePlus className="h-3.5 w-3.5 mr-1.5" />
                    Add Document
                  </Button>
                </div>
              ) : (
                <div>
                  {folder.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group/doc border-t border-border/20 first:border-t-0"
                    >
                      <div className="w-6" />
                      <FileText className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      <Link
                        href={`/resources/${doc.id}`}
                        className="flex-1 text-[13px] font-medium text-foreground/80 hover:text-foreground truncate"
                      >
                        {doc.title}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md opacity-0 group-hover/doc:opacity-100 transition-opacity"
                        onClick={() => deleteDocument(doc.id, doc.title)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-border/20">
                    <button
                      onClick={() => setNewDocOpen(folder.id)}
                      className="text-[12px] text-muted-foreground/40 hover:text-muted-foreground font-medium transition-colors"
                    >
                      + Add document
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* New folder button */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" className="w-full border-dashed">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => { if (e.key === "Enter") createFolder(); }}
              autoFocus
            />
            <Button onClick={createFolder} className="w-full" disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New document dialog */}
      <Dialog open={!!newDocOpen} onOpenChange={(open) => !open && setNewDocOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Document title"
              onKeyDown={(e) => { if (e.key === "Enter" && newDocOpen) createDocument(newDocOpen); }}
              autoFocus
            />
            <Button
              onClick={() => newDocOpen && createDocument(newDocOpen)}
              className="w-full"
              disabled={!newDocTitle.trim()}
            >
              Create Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
