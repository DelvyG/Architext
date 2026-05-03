"use client";

import type { ReactNode } from "react";
import { Handle, Position } from "@xyflow/react";
import { useCanvasStore } from "@/lib/stores/canvas-store";

type Props = {
  id: string;
  icon: ReactNode;
  label: string;
  subtitle?: string;
  color: string;
  children?: ReactNode;
};

export function BaseNode({ id, icon, label, subtitle, color, children }: Props) {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const selectNode = useCanvasStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`min-w-[180px] max-w-[260px] rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-colors ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/40"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded ${color}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{label}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
