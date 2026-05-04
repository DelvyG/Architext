"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EndpointData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: EndpointData };

export function EndpointInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Method</Label>
        <Select
          value={data.method}
          onValueChange={(v) => updateNode(nodeId, { method: v as EndpointData["method"] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Path</Label>
        <Input value={data.path} onChange={(e) => updateNode(nodeId, { path: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Auth</Label>
        <Select
          value={data.auth}
          onValueChange={(v) => updateNode(nodeId, { auth: v as EndpointData["auth"] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="required">Required</SelectItem>
            <SelectItem value="role-based">Role-based</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input
          value={data.description ?? ""}
          onChange={(e) => updateNode(nodeId, { description: e.target.value })}
        />
      </div>
    </div>
  );
}
