"use client";

import { ListOrdered } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { QueueData } from "@/lib/blocks/schemas";

export function QueueNode({ id, data, selected }: NodeProps & { data: QueueData }) {
  return (
    <BaseNode
      id={id}
      icon={<ListOrdered className="h-3.5 w-3.5 text-indigo-700" />}
      label={data.name}
      subtitle={`${data.events.length} events`}
      color="bg-indigo-100 dark:bg-indigo-900"
    />
  );
}
