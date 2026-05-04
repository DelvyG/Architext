"use client";

import { Database } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { DataModelData } from "@/lib/blocks/schemas";

export function DataModelNode({ id, data, selected }: NodeProps & { data: DataModelData }) {
  return (
    <BaseNode
      id={id}
      icon={<Database className="h-3.5 w-3.5 text-blue-700" />}
      label={data.name}
      subtitle={`${data.fields.length} fields, ${data.relations.length} relations`}
      color="bg-blue-100 dark:bg-blue-900"
    />
  );
}
