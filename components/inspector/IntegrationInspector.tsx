"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { IntegrationData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: IntegrationData };

export function IntegrationInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Service</Label>
        <Input
          value={data.service}
          onChange={(e) => updateNode(nodeId, { service: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Purpose</Label>
        <Input
          value={data.purpose}
          onChange={(e) => updateNode(nodeId, { purpose: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Secrets needed (comma-separated)</Label>
        <Input
          value={data.secretsNeeded.join(", ")}
          onChange={(e) =>
            updateNode(nodeId, {
              secretsNeeded: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
    </div>
  );
}
