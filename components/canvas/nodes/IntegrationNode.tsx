"use client";

import { Plug } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { IntegrationData } from "@/lib/blocks/schemas";

export function IntegrationNode({ id, data, selected }: NodeProps & { data: IntegrationData }) {
  return (
    <BaseNode
      id={id}
      icon={<Plug className="h-3.5 w-3.5 text-orange-700" />}
      label={data.service}
      subtitle={data.purpose}
      color="bg-orange-100 dark:bg-orange-900"
    />
  );
}
