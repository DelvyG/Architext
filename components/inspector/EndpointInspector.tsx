"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { EndpointData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: EndpointData };

export function EndpointInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Method</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={data.method}
          onChange={(e) =>
            updateNode(nodeId, {
              method: e.target.value as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
            })
          }
        >
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Path</Label>
        <Input value={data.path} onChange={(e) => updateNode(nodeId, { path: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Auth</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={data.auth}
          onChange={(e) =>
            updateNode(nodeId, { auth: e.target.value as "none" | "required" | "role-based" })
          }
        >
          <option value="none">None</option>
          <option value="required">Required</option>
          <option value="role-based">Role-based</option>
        </select>
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
