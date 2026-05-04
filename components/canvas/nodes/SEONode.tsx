"use client";

import { Search } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { SEOData } from "@/lib/blocks/schemas";

export function SEONode({ id, data, selected }: NodeProps & { data: SEOData }) {
  return (
    <BaseNode
      id={id}
      icon={<Search className="h-3.5 w-3.5 text-teal-700" />}
      label={data.name}
      subtitle={`${data.strategies.length} strategies`}
      color="bg-teal-100 dark:bg-teal-900"
    />
  );
}
