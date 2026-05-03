"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { JobData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: JobData };

export function JobInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={data.name} onChange={(e) => updateNode(nodeId, { name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Trigger</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={data.trigger}
          onChange={(e) =>
            updateNode(nodeId, { trigger: e.target.value as "cron" | "webhook" | "event" })
          }
        >
          <option value="cron">Cron</option>
          <option value="webhook">Webhook</option>
          <option value="event">Event</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Frequency</Label>
        <Input
          value={data.frequency ?? ""}
          onChange={(e) => updateNode(nodeId, { frequency: e.target.value })}
          placeholder="e.g. every 5 minutes"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Action</Label>
        <Input
          value={data.action}
          onChange={(e) => updateNode(nodeId, { action: e.target.value })}
          placeholder="What does this job do?"
        />
      </div>
    </div>
  );
}
