"use client";

import { Handle, Position, useNodeId, useStore } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { GroupData } from "@/lib/blocks/schemas";

export function GroupNode({ id, data }: NodeProps & { data: GroupData }) {
  const nodeId = useNodeId();
  const isSelected = useStore((s) => {
    const node = s.nodes.find((n) => n.id === (nodeId ?? id));
    return node?.selected ?? false;
  });

  return (
    <div
      className={`min-h-[200px] min-w-[300px] rounded-xl border-2 border-dashed p-4 transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "border-border/50 bg-muted/20"
      }`}
      style={{ backgroundColor: data.color ? `${data.color}20` : undefined }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {data.name}
      </div>
      {data.description && <p className="text-xs text-muted-foreground">{data.description}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
