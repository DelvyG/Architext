"use client";

import { HardDrive } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { StorageData } from "@/lib/blocks/schemas";

export function StorageNode({ id, data, selected }: NodeProps & { data: StorageData }) {
  return (
    <BaseNode
      id={id}
      icon={<HardDrive className="h-3.5 w-3.5 text-slate-700" />}
      label={data.name}
      subtitle={data.provider}
      color="bg-slate-100 dark:bg-slate-900"
    />
  );
}
