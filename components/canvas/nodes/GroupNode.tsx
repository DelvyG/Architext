"use client";

import { NodeResizer, useNodeId, useStore } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { GroupData } from "@/lib/blocks/schemas";

export function GroupNode({ id, data }: NodeProps & { data: GroupData }) {
  const nodeId = useNodeId();
  const isSelected = useStore((s) => {
    const node = s.nodes.find((n) => n.id === (nodeId ?? id));
    return node?.selected ?? false;
  });

  return (
    <>
      <NodeResizer
        isVisible={isSelected}
        minWidth={250}
        minHeight={150}
        lineStyle={{ borderColor: "hsl(var(--primary))", borderWidth: 1 }}
        handleStyle={{ width: 8, height: 8, backgroundColor: "hsl(var(--primary))" }}
      />
      <div
        className={`h-full w-full rounded-xl border-2 border-dashed transition-colors ${
          isSelected ? "border-primary" : "border-border/60"
        }`}
        style={{
          backgroundColor: data.color ? `${data.color}15` : "rgba(0,0,0,0.02)",
          padding: 12,
        }}
      >
        <div className="group-drag-handle cursor-grab rounded px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-black/5 active:cursor-grabbing">
          {data.name}
        </div>
        {data.description && (
          <p className="mt-1 px-2 text-xs text-muted-foreground/70">{data.description}</p>
        )}
      </div>
    </>
  );
}
