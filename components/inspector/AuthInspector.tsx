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
import type { AuthData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: AuthData };

export function AuthInspector({ nodeId, data }: Props) {
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Method</Label>
        <Select
          value={data.method}
          onValueChange={(v) => updateNode(nodeId, { method: v as AuthData["method"] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email-password">Email/Password</SelectItem>
            <SelectItem value="oauth">OAuth</SelectItem>
            <SelectItem value="magic-link">Magic Link</SelectItem>
            <SelectItem value="api-key">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Roles (comma-separated)</Label>
        <Input
          value={data.roles.join(", ")}
          onChange={(e) =>
            updateNode(nodeId, {
              roles: e.target.value
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
