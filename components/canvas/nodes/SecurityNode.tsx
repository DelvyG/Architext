"use client";

import { ShieldCheck } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { SecurityData } from "@/lib/blocks/schemas";

export function SecurityNode({ id, data }: NodeProps & { data: SecurityData }) {
  return (
    <BaseNode
      id={id}
      icon={<ShieldCheck className="h-3.5 w-3.5 text-rose-700" />}
      label={data.name}
      subtitle={`${data.policies.length} policies`}
      color="bg-rose-100 dark:bg-rose-900"
    />
  );
}
