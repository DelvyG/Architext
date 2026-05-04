"use client";

import type { NodeProps } from "@xyflow/react";
import type { GroupData } from "@/lib/blocks/schemas";

export function GroupNode({ data }: NodeProps & { data: GroupData }) {
  return (
    <div
      className="rounded-xl border-2 border-dashed border-border/60"
      style={{
        backgroundColor: data.color ? `${data.color}15` : "rgba(0,0,0,0.02)",
        width: "100%",
        height: "100%",
        padding: 12,
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {data.name}
      </div>
    </div>
  );
}
