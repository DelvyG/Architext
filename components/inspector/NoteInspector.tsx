"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import type { NoteData } from "@/lib/blocks/schemas";

type Props = {
  nodeId: string;
  data: NoteData;
};

export function NoteInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Content</Label>
        <textarea
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={data.content}
          onChange={(e) => updateNode(nodeId, { content: e.target.value })}
          placeholder="Write your note..."
        />
      </div>
    </div>
  );
}
