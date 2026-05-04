"use client";

import { Layout } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { ViewData } from "@/lib/blocks/schemas";

export function ViewNode({ id, data, selected }: NodeProps & { data: ViewData }) {
  return (
    <BaseNode
      id={id}
      selected={selected}
      icon={<Layout className="h-3.5 w-3.5 text-purple-700" />}
      label={data.name}
      subtitle={data.route ?? undefined}
      color="bg-purple-100 dark:bg-purple-900"
    />
  );
}
