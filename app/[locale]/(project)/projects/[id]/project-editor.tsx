"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/inspector/Inspector";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasNode, CanvasEdge } from "@/lib/blocks/schemas";
import { saveCanvas } from "./actions";

type Props = {
  projectId: string;
  projectName: string;
  initialCanvas: { nodes: unknown[]; edges: unknown[] };
  initialMessages: { role: string; content: string }[];
};

export function ProjectEditor({ projectId, projectName, initialCanvas, initialMessages }: Props) {
  const t = useTranslations("project.editor");
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const setIsSaving = useCanvasStore((s) => s.setIsSaving);
  const setIsDirty = useCanvasStore((s) => s.setIsDirty);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

  useEffect(() => {
    loadCanvas(
      projectId,
      (initialCanvas.nodes ?? []) as CanvasNode[],
      (initialCanvas.edges ?? []) as CanvasEdge[],
    );
  }, [projectId, initialCanvas, loadCanvas]);

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

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToProjects")}
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <h1 className="text-sm font-medium">{projectName}</h1>
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
    </div>
  );
}
