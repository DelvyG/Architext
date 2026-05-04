"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

type Props = {
  nodeId: string;
  name: string;
  description?: string | null;
  listLabel: string;
  items: string[];
  onNameChange: (name: string) => void;
  onDescriptionChange?: (desc: string) => void;
  onItemsChange: (items: string[]) => void;
  children?: React.ReactNode;
};

export function SimpleListInspector({
  nodeId,
  name,
  description,
  listLabel,
  items,
  onNameChange,
  onDescriptionChange,
  onItemsChange,
  children,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
      </div>
      {onDescriptionChange !== undefined && (
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input
            value={description ?? ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Optional"
          />
        </div>
      )}
      {children}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{listLabel}</Label>
          <Button variant="ghost" size="sm" onClick={() => onItemsChange([...items, ""])}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              className="flex-1"
              value={item}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                onItemsChange(updated);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onItemsChange(items.filter((_, idx) => idx !== i))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
