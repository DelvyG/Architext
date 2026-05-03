"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { NoteInspector } from "./NoteInspector";
import { DataModelInspector } from "./DataModelInspector";
import { EndpointInspector } from "./EndpointInspector";
import { ViewInspector } from "./ViewInspector";
import { IntegrationInspector } from "./IntegrationInspector";
import { UserFlowInspector } from "./UserFlowInspector";
import { AuthInspector } from "./AuthInspector";
import { JobInspector } from "./JobInspector";
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

  function renderInspector() {
    if (!node) return null;
    switch (node.data.blockType) {
      case "Note":
        return <NoteInspector nodeId={node.id} data={node.data} />;
      case "DataModel":
        return <DataModelInspector nodeId={node.id} data={node.data} />;
      case "Endpoint":
        return <EndpointInspector nodeId={node.id} data={node.data} />;
      case "View":
        return <ViewInspector nodeId={node.id} data={node.data} />;
      case "Integration":
        return <IntegrationInspector nodeId={node.id} data={node.data} />;
      case "UserFlow":
        return <UserFlowInspector nodeId={node.id} data={node.data} />;
      case "Auth":
        return <AuthInspector nodeId={node.id} data={node.data} />;
      case "Job":
        return <JobInspector nodeId={node.id} data={node.data} />;
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{node.type}</h3>
        <Button variant="ghost" size="icon" onClick={() => deleteNode(node.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {renderInspector()}
    </div>
  );
}
