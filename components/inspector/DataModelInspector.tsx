"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { DataModelData, Field } from "@/lib/blocks/schemas";

type Props = {
  nodeId: string;
  data: DataModelData;
};

export function DataModelInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  function updateField(index: number, partial: Partial<Field>) {
    const newFields = [...data.fields];
    const existing = newFields[index];
    if (existing) {
      newFields[index] = { ...existing, ...partial };
      updateNode(nodeId, { fields: newFields });
    }
  }

  function addField() {
    updateNode(nodeId, {
      fields: [...data.fields, { name: "", type: "string", required: false }],
    });
  }

  function removeField(index: number) {
    updateNode(nodeId, {
      fields: data.fields.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={data.name} onChange={(e) => updateNode(nodeId, { name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input
          value={data.description ?? ""}
          onChange={(e) => updateNode(nodeId, { description: e.target.value })}
          placeholder="Optional"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Fields</Label>
          <Button variant="ghost" size="sm" onClick={addField}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        {data.fields.map((field, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              className="flex-1"
              value={field.name}
              onChange={(e) => updateField(i, { name: e.target.value })}
              placeholder="name"
            />
            <Input
              className="w-20"
              value={field.type}
              onChange={(e) => updateField(i, { type: e.target.value })}
              placeholder="type"
            />
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(i, { required: e.target.checked })}
              />
              req
            </label>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeField(i)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
