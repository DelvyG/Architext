"use client";

import type { NodeProps } from "@xyflow/react";
import type { GroupData } from "@/lib/blocks/schemas";

export function GroupNode({ data }: NodeProps & { data: GroupData }) {
  const w = data.width ?? 400;
  const h = data.height ?? 300;

  return (
    <div
      style={{
        width: w,
        height: h,
        backgroundColor: data.color ? `${data.color}15` : "rgba(0,0,0,0.02)",
        borderRadius: 12,
        border: "2px dashed rgba(0,0,0,0.15)",
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#888",
        }}
      >
        {data.name}
      </div>
    </div>
  );
}
