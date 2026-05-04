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
import { SimpleListInspector } from "./SimpleListInspector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export function Inspector() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const updateNode = useCanvasStore((s) => s.updateNode);

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
    const d = node.data;
    switch (d.blockType) {
      case "Note":
        return <NoteInspector nodeId={node.id} data={d} />;
      case "DataModel":
        return <DataModelInspector nodeId={node.id} data={d} />;
      case "Endpoint":
        return <EndpointInspector nodeId={node.id} data={d} />;
      case "View":
        return <ViewInspector nodeId={node.id} data={d} />;
      case "Integration":
        return <IntegrationInspector nodeId={node.id} data={d} />;
      case "UserFlow":
        return <UserFlowInspector nodeId={node.id} data={d} />;
      case "Auth":
        return <AuthInspector nodeId={node.id} data={d} />;
      case "Job":
        return <JobInspector nodeId={node.id} data={d} />;
      case "Security":
        return (
          <SimpleListInspector
            nodeId={node.id}
            name={d.name}
            description={d.description}
            listLabel="Policies"
            items={d.policies}
            onNameChange={(name) => updateNode(node.id, { name })}
            onDescriptionChange={(description) => updateNode(node.id, { description })}
            onItemsChange={(policies) => updateNode(node.id, { policies })}
          />
        );
      case "Cache":
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={d.name}
                onChange={(e) => updateNode(node.id, { name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Strategy</Label>
              <Select
                value={d.strategy}
                onValueChange={(v) => v && updateNode(node.id, { strategy: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["redis", "in-memory", "cdn", "browser", "custom"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>TTL</Label>
              <Input
                value={d.ttl ?? ""}
                onChange={(e) => updateNode(node.id, { ttl: e.target.value })}
                placeholder="e.g. 5m, 1h"
              />
            </div>
          </div>
        );
      case "Queue":
        return (
          <SimpleListInspector
            nodeId={node.id}
            name={d.name}
            description={d.description}
            listLabel="Events"
            items={d.events}
            onNameChange={(name) => updateNode(node.id, { name })}
            onDescriptionChange={(description) => updateNode(node.id, { description })}
            onItemsChange={(events) => updateNode(node.id, { events })}
          >
            <div className="space-y-1.5">
              <Label>Broker</Label>
              <Input
                value={d.broker}
                onChange={(e) => updateNode(node.id, { broker: e.target.value })}
              />
            </div>
          </SimpleListInspector>
        );
      case "Storage":
        return (
          <SimpleListInspector
            nodeId={node.id}
            name={d.name}
            description={d.description}
            listLabel="File types"
            items={d.fileTypes}
            onNameChange={(name) => updateNode(node.id, { name })}
            onDescriptionChange={(description) => updateNode(node.id, { description })}
            onItemsChange={(fileTypes) => updateNode(node.id, { fileTypes })}
          >
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Input
                value={d.provider}
                onChange={(e) => updateNode(node.id, { provider: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max size</Label>
              <Input
                value={d.maxSize ?? ""}
                onChange={(e) => updateNode(node.id, { maxSize: e.target.value })}
                placeholder="e.g. 10MB"
              />
            </div>
          </SimpleListInspector>
        );
      case "SEO":
        return (
          <SimpleListInspector
            nodeId={node.id}
            name={d.name}
            description={d.description}
            listLabel="Strategies"
            items={d.strategies}
            onNameChange={(name) => updateNode(node.id, { name })}
            onDescriptionChange={(description) => updateNode(node.id, { description })}
            onItemsChange={(strategies) => updateNode(node.id, { strategies })}
          />
        );
      case "Group":
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={d.name}
                onChange={(e) => updateNode(node.id, { name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={d.description ?? ""}
                onChange={(e) => updateNode(node.id, { description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <input
                type="color"
                value={d.color ?? "#e2e8f0"}
                onChange={(e) => updateNode(node.id, { color: e.target.value })}
                className="h-8 w-full cursor-pointer rounded border"
              />
            </div>
          </div>
        );
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
