"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X, Check } from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
}

interface TaskChecklistProps {
  taskId: string;
  items: ChecklistItem[];
  onUpdate: () => void;
}

export function TaskChecklist({ taskId, items: initialItems, onUpdate }: TaskChecklistProps) {
  const [items, setItems] = useState(initialItems);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  async function addItem() {
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems([...items, item]);
      setNewText("");
      onUpdate();
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    setAdding(false);
  }

  async function toggleItem(item: ChecklistItem) {
    const newCompleted = !item.completed;
    setItems(items.map((i) => (i.id === item.id ? { ...i, completed: newCompleted } : i)));
    await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, completed: newCompleted }),
    });
    onUpdate();
  }

  async function deleteItem(itemId: string) {
    setItems(items.filter((i) => i.id !== itemId));
    await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId }),
    });
    onUpdate();
  }

  async function updateText(item: ChecklistItem, text: string) {
    if (!text.trim() || text === item.text) return;
    setItems(items.map((i) => (i.id === item.id ? { ...i, text } : i)));
    await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, text: text.trim() }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-foreground/70">
          Checklist {total > 0 && `(${completed}/${total})`}
        </label>
      </div>

      {total > 0 && (
        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              progress === 100 ? "bg-emerald-500" : "bg-blue-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="space-y-0.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 group rounded-lg px-1 py-1 hover:bg-muted/30 transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleItem(item)}
              className={cn(
                "h-[18px] w-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150",
                item.completed
                  ? "bg-blue-500 border-blue-500"
                  : "border-border/80 hover:border-blue-400"
              )}
            >
              {item.completed && <Check className="h-3 w-3 text-white" />}
            </button>
            <input
              type="text"
              defaultValue={item.text}
              onBlur={(e) => updateText(item, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className={cn(
                "flex-1 bg-transparent text-[13px] outline-none py-0.5 transition-colors",
                item.completed && "line-through text-muted-foreground/50"
              )}
            />
            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
        className="flex items-center gap-2"
      >
        <Input
          ref={inputRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add sub-task..."
          disabled={adding}
          className="text-[13px] h-8 bg-transparent border-dashed"
        />
        <button
          type="submit"
          disabled={adding || !newText.trim()}
          className="text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
