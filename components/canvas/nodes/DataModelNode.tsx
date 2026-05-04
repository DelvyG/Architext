"use client";

import { Handle, Position } from "@xyflow/react";
import { Key, Link2 } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { DataModelData } from "@/lib/blocks/schemas";

export function DataModelNode({ id, data, selected }: NodeProps & { data: DataModelData }) {
  return (
    <div
      className={`min-w-[220px] overflow-hidden rounded-lg border bg-card shadow-sm transition-colors ${
        selected ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />

      {/* Table header */}
      <div className="bg-blue-600 px-3 py-2 text-white">
        <p className="text-sm font-semibold">{data.name}</p>
      </div>

      {/* Fields */}
      <div className="divide-y divide-border">
        {data.fields.map((field, i) => {
          const isPK = field.name === "id" || field.unique;
          const isFK = field.name.endsWith("Id") || field.name.endsWith("_id");
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs">
              <span className="w-5 shrink-0 text-muted-foreground">
                {isPK && <Key className="h-3 w-3 text-amber-500" />}
                {isFK && !isPK && <Link2 className="h-3 w-3 text-blue-400" />}
              </span>
              <span className="flex-1 font-medium">{field.name}</span>
              <span className="text-muted-foreground">{field.type}</span>
              {field.required && <span className="text-[9px] text-red-400">*</span>}
            </div>
          );
        })}
        {data.fields.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">No fields</div>
        )}
      </div>

      {/* Relations footer */}
      {data.relations.length > 0 && (
        <div className="border-t bg-muted/30 px-3 py-1.5">
          {data.relations.map((rel, i) => (
            <p key={i} className="text-[10px] text-muted-foreground">
              {rel.type} → {rel.target}
            </p>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
