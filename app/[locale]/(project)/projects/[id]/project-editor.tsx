"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/inspector/Inspector";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasNode, CanvasEdge } from "@/lib/blocks/schemas";
import { saveCanvas } from "./actions";
import { createSnapshot, getSnapshots, restoreSnapshot } from "./snapshot-actions";
import { generateShareToken, revokeShareToken } from "./share-actions";
import { Camera, History, Key, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Snapshot = {
  id: string;
  reason: string;
  label: string | null;
  createdAt: Date;
};

type Props = {
  projectId: string;
  projectName: string;
  initialCanvas: { nodes: unknown[]; edges: unknown[] };
  initialMessages: { role: string; content: string }[];
  hasApiKey: boolean;
  activeProvider?: string;
};

export function ProjectEditor({
  projectId,
  projectName,
  initialCanvas,
  initialMessages,
  hasApiKey,
  activeProvider,
}: Props) {
  const t = useTranslations("project.editor");
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const setIsSaving = useCanvasStore((s) => s.setIsSaving);
  const setIsDirty = useCanvasStore((s) => s.setIsDirty);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [showSaveSnapshot, setShowSaveSnapshot] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCanvas(
      projectId,
      (initialCanvas.nodes ?? []) as CanvasNode[],
      (initialCanvas.edges ?? []) as CanvasEdge[],
    );
  }, [projectId, initialCanvas, loadCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setShowSaveSnapshot(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        window.location.href = `/projects/${projectId}/export`;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projectId]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveCanvas(projectId, { nodes, edges });
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save canvas:", err);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, nodes, edges, setIsSaving, setIsDirty]);

  async function handleSaveSnapshot() {
    await createSnapshot(projectId, snapshotLabel || undefined);
    toast.success("Snapshot saved");
    setShowSaveSnapshot(false);
    setSnapshotLabel("");
  }

  async function handleShowHistory() {
    const list = await getSnapshots(projectId);
    setSnapshots(list);
    setShowSnapshots(true);
  }

  async function handleRestore(snapshotId: string) {
    const canvas = await restoreSnapshot(projectId, snapshotId);
    const c = canvas as { nodes: CanvasNode[]; edges: CanvasEdge[] };
    loadCanvas(projectId, c.nodes ?? [], c.edges ?? []);
    setShowSnapshots(false);
    toast.success("Canvas restored from snapshot");
  }

  return (
    <div className="flex h-screen flex-col">
      {!hasApiKey && (
        <div className="flex items-center justify-center gap-3 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <Key className="h-4 w-4" />
          <span>Configure your AI provider key to generate architecture</span>
          <Link href="/settings/api-keys">
            <Button size="sm" variant="outline" className="h-7 text-xs">
              Add API Key
            </Button>
          </Link>
        </div>
      )}
      {hasApiKey && activeProvider && (
        <div className="flex items-center justify-end gap-2 border-b bg-muted/30 px-4 py-1 text-xs text-muted-foreground">
          <span>AI: {activeProvider}</span>
          <Link href="/settings/api-keys" className="underline hover:text-foreground">
            Change
          </Link>
        </div>
      )}
      <header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToProjects")}
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <h1 className="text-sm font-medium">{projectName}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSaveSnapshot(true)}>
            <Camera className="mr-1 h-3.5 w-3.5" />
            Snapshot
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShowHistory}>
            <History className="mr-1 h-3.5 w-3.5" />
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const token = await generateShareToken(projectId);
              setShareToken(token);
              setShowShare(true);
            }}
          >
            <Share2 className="mr-1 h-3.5 w-3.5" />
            Share
          </Button>
          <Link href={`/projects/${projectId}/export`}>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </Link>
        </div>
      </header>
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={15}>
          <ChatPanel projectId={projectId} initialMessages={initialMessages} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55} minSize={30}>
          <Canvas onSave={handleSave} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} minSize={15}>
          <Inspector />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Save Snapshot Dialog */}
      <Dialog open={showSaveSnapshot} onOpenChange={setShowSaveSnapshot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save snapshot</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Label (optional)"
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveSnapshot(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSnapshot}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snapshot History Dialog */}
      <Dialog open={showSnapshots} onOpenChange={setShowSnapshots}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Snapshot history</DialogTitle>
          </DialogHeader>
          {snapshots.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No snapshots yet</p>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{snap.label || snap.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(snap.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRestore(snap.id)}>
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share project</DialogTitle>
          </DialogHeader>
          {shareToken && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Anyone with this command can pull your architecture into their project:
              </p>
              <div className="rounded-md bg-muted p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Pull CLAUDE.md into your project:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs break-all">
                    npx architext-cli pull {shareToken}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`npx architext-cli pull ${shareToken}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Or use curl:</p>
                <code className="text-xs break-all">
                  curl {window.location.origin}/api/share/{shareToken}/claude-md &gt; CLAUDE.md
                </code>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>
                  Other formats: <code>prompt</code>, <code>prd</code>, <code>sql</code>,{" "}
                  <code>canvas</code>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await revokeShareToken(projectId);
                setShareToken(null);
                setShowShare(false);
                toast.success("Share link revoked");
              }}
            >
              Revoke access
            </Button>
            <Button variant="outline" onClick={() => setShowShare(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
