"use client";

import { Zap } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { CacheData } from "@/lib/blocks/schemas";

export function CacheNode({ id, data, selected }: NodeProps & { data: CacheData }) {
  return (
    <BaseNode
      id={id}
      icon={<Zap className="h-3.5 w-3.5 text-emerald-700" />}
      label={data.name}
      subtitle={data.strategy}
      color="bg-emerald-100 dark:bg-emerald-900"
    />
  );
}
