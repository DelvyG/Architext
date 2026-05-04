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
        <Select
          value={data.trigger}
          onValueChange={(v) => updateNode(nodeId, { trigger: v as JobData["trigger"] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cron">Cron</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
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
