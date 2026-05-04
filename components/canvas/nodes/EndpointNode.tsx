"use client";

import { Globe } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { EndpointData } from "@/lib/blocks/schemas";

export function EndpointNode({ id, data, selected }: NodeProps & { data: EndpointData }) {
  return (
    <BaseNode
      accentColor="#22c55e"
      id={id}
      selected={selected}
      icon={<Globe className="h-3.5 w-3.5 text-green-700" />}
      label={`${data.method} ${data.path}`}
      subtitle={data.auth !== "none" ? `auth: ${data.auth}` : undefined}
      color="bg-green-100 dark:bg-green-900"
    />
  );
}
