"use client";

import { StickyNote } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import type { NoteData } from "@/lib/blocks/schemas";

export function NoteNode({ id, data }: NodeProps & { data: NoteData }) {
  return (
    <BaseNode
      id={id}
      icon={<StickyNote className="h-3.5 w-3.5 text-yellow-700" />}
      label="Note"
      subtitle={data.content.slice(0, 60) || "Empty note"}
      color="bg-yellow-100 dark:bg-yellow-900"
    />
  );
}
