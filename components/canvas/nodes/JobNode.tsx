"use client";

import { Clock } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { JobData } from "@/lib/blocks/schemas";

export function JobNode({ id, data, selected }: NodeProps & { data: JobData }) {
  return (
    <BaseNode
      id={id}
      icon={<Clock className="h-3.5 w-3.5 text-amber-700" />}
      label={data.name}
      subtitle={`${data.trigger}${data.frequency ? `: ${data.frequency}` : ""}`}
      color="bg-amber-100 dark:bg-amber-900"
    />
  );
}
