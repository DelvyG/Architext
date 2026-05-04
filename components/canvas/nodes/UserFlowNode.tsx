"use client";

import { GitBranch } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { UserFlowData } from "@/lib/blocks/schemas";

export function UserFlowNode({ id, data, selected }: NodeProps & { data: UserFlowData }) {
  return (
    <BaseNode
      id={id}
      icon={<GitBranch className="h-3.5 w-3.5 text-cyan-700" />}
      label={data.name}
      subtitle={`${data.steps.length} steps`}
      color="bg-cyan-100 dark:bg-cyan-900"
    />
  );
}
