"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

const EDGE_COLORS: Record<string, string> = {
  uses: "#3b82f6",
  dependsOn: "#f59e0b",
  protects: "#ef4444",
  navigatesTo: "#8b5cf6",
};

export function TypedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const edgeType = (data as { type?: string } | undefined)?.type ?? "uses";
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: EDGE_COLORS[edgeType] ?? "#999" }} />
      <text
        x={labelX}
        y={labelY}
        className="fill-muted-foreground text-[10px]"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {edgeType}
      </text>
    </>
  );
}
