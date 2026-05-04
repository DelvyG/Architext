"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

const EDGE_COLORS: Record<string, string> = {
  uses: "#3b82f6",
  dependsOn: "#f59e0b",
  protects: "#ef4444",
  navigatesTo: "#8b5cf6",
};

const EDGE_LABELS: Record<string, string> = {
  uses: "uses",
  dependsOn: "depends",
  protects: "protects",
  navigatesTo: "→",
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const color = EDGE_COLORS[edgeType] ?? "#999";

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: color, strokeWidth: 1.5 }} />
      <rect
        x={labelX - 22}
        y={labelY - 8}
        width={44}
        height={16}
        rx={4}
        fill="white"
        stroke={color}
        strokeWidth={0.5}
      />
      <text
        x={labelX}
        y={labelY}
        fill={color}
        className="text-[9px] font-medium"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {EDGE_LABELS[edgeType] ?? edgeType}
      </text>
    </>
  );
}
