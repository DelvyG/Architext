"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { NoteInspector } from "./NoteInspector";
import { DataModelInspector } from "./DataModelInspector";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function Inspector() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const deleteNode = useCanvasStore((s) => s.deleteNode);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Select a block to edit</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{node.type}</h3>
        <Button variant="ghost" size="icon" onClick={() => deleteNode(node.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {node.data.blockType === "Note" && <NoteInspector nodeId={node.id} data={node.data} />}
      {node.data.blockType === "DataModel" && (
        <DataModelInspector nodeId={node.id} data={node.data} />
      )}
      {node.data.blockType !== "Note" && node.data.blockType !== "DataModel" && (
        <p className="text-sm text-muted-foreground">
          Inspector for {node.data.blockType} coming soon
        </p>
      )}
    </div>
  );
}
