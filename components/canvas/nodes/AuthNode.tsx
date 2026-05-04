"use client";

import { Shield } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { AuthData } from "@/lib/blocks/schemas";

export function AuthNode({ id, data, selected }: NodeProps & { data: AuthData }) {
  return (
    <BaseNode
      accentColor="#22c55e"
      id={id}
      selected={selected}
      icon={<Shield className="h-3.5 w-3.5 text-red-700" />}
      label={data.method}
      subtitle={`${data.roles.length} roles`}
      color="bg-red-100 dark:bg-red-900"
    />
  );
}
