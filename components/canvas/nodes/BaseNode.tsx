"use client";

import type { ReactNode } from "react";
import { Handle, Position } from "@xyflow/react";

type Props = {
  id: string;
  selected?: boolean;
  icon: ReactNode;
  label: string;
  subtitle?: string;
  color: string;
  accentColor?: string;
  children?: ReactNode;
};

export function BaseNode({ icon, label, subtitle, color, accentColor, children, selected }: Props) {
  return (
    <div
      className={`min-w-[200px] max-w-[280px] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-colors ${
        selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="flex">
        {accentColor && <div className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded ${color}`}>
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{label}</p>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {children}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
