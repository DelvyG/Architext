"use client";

import { useCanvasStore } from "@/lib/stores/canvas-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AuthData } from "@/lib/blocks/schemas";

type Props = { nodeId: string; data: AuthData };

export function AuthInspector({ nodeId, data }: Props) {
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
              method: e.target.value as "email-password" | "oauth" | "magic-link" | "api-key",
            })
          }
        >
          <option value="email-password">Email/Password</option>
          <option value="oauth">OAuth</option>
          <option value="magic-link">Magic Link</option>
          <option value="api-key">API Key</option>
        </select>
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
