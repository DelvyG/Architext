"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { UserFlowData, UserFlowStep } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: UserFlowData };

export function UserFlowInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  function updateStep(index: number, partial: Partial<UserFlowStep>) {
    const newSteps = [...data.steps];
    const existing = newSteps[index];
    if (existing) {
      newSteps[index] = { ...existing, ...partial };
      updateNode(nodeId, { steps: newSteps });
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={data.name} onChange={(e) => updateNode(nodeId, { name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateNode(nodeId, {
                steps: [...data.steps, { actor: "User", action: "" }],
              })
            }
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        {data.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              className="w-20"
              value={step.actor}
              onChange={(e) => updateStep(i, { actor: e.target.value })}
              placeholder="Actor"
            />
            <Input
              className="flex-1"
              value={step.action}
              onChange={(e) => updateStep(i, { action: e.target.value })}
              placeholder="Action"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() =>
                updateNode(nodeId, { steps: data.steps.filter((_, idx) => idx !== i) })
              }
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
