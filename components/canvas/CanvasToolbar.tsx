"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import { BLOCK_TYPES, type BlockType } from "@/lib/blocks/schemas";

const BLOCK_LABELS: Record<BlockType, string> = {
  DataModel: "Data Model",
  Endpoint: "Endpoint",
  View: "View",
  Integration: "Integration",
  UserFlow: "User Flow",
  Auth: "Auth",
  Job: "Job",
  Note: "Note",
};

let counter = 0;

export function CanvasToolbar() {
  const addNode = useCanvasStore((s) => s.addNode);

  function handleAddBlock(type: BlockType) {
    counter++;
    const x = 250 + (counter % 5) * 50;
    const y = 150 + (counter % 3) * 80;
    addNode(type, { x, y });
  }

  return (
    <div className="absolute left-3 top-3 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted">
          <Plus className="h-4 w-4" />
          Add block
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {BLOCK_TYPES.map((type) => (
            <DropdownMenuItem key={type} onClick={() => handleAddBlock(type)}>
              {BLOCK_LABELS[type]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
