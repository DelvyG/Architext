"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ViewData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: ViewData };

export function ViewInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={data.name} onChange={(e) => updateNode(nodeId, { name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Route</Label>
        <Input
          value={data.route ?? ""}
          onChange={(e) => updateNode(nodeId, { route: e.target.value })}
          placeholder="/dashboard"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={data.notes ?? ""}
          onChange={(e) => updateNode(nodeId, { notes: e.target.value })}
        />
      </div>
    </div>
  );
}
