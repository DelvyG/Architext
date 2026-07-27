"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutGrid,
  Database,
  Globe,
  Layout,
  Plug,
  GitBranch,
  Shield,
  Clock,
  StickyNote,
  ShieldCheck,
  Zap,
  ListOrdered,
  HardDrive,
  Search,
  FolderOpen,
  Image,
} from "lucide-react";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { BlockType } from "@/lib/blocks/schemas";
import { toast } from "sonner";
import { toPng, toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds, useReactFlow } from "@xyflow/react";

const BLOCK_CATEGORIES = [
  {
    label: "Core",
    items: [
      { type: "DataModel" as BlockType, label: "Data Model", icon: Database },
      { type: "Endpoint" as BlockType, label: "Endpoint", icon: Globe },
      { type: "View" as BlockType, label: "View / Page", icon: Layout },
    ],
  },
  {
    label: "Logic",
    items: [
      { type: "Auth" as BlockType, label: "Auth", icon: Shield },
      { type: "UserFlow" as BlockType, label: "User Flow", icon: GitBranch },
      { type: "Job" as BlockType, label: "Background Job", icon: Clock },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { type: "Integration" as BlockType, label: "Integration", icon: Plug },
      { type: "Security" as BlockType, label: "Security", icon: ShieldCheck },
      { type: "Cache" as BlockType, label: "Cache", icon: Zap },
      { type: "Queue" as BlockType, label: "Queue", icon: ListOrdered },
      { type: "Storage" as BlockType, label: "Storage", icon: HardDrive },
    ],
  },
  {
    label: "Other",
    items: [
      { type: "SEO" as BlockType, label: "SEO", icon: Search },
      { type: "Note" as BlockType, label: "Note", icon: StickyNote },
      { type: "Group" as BlockType, label: "Group", icon: FolderOpen },
    ],
  },
];

// Layout: 3 columns
const LAYOUT_COLUMNS: { label: string; types: BlockType[] }[] = [
  { label: "BACKEND", types: ["DataModel", "Endpoint", "Auth", "Job"] },
  { label: "FRONTEND", types: ["View", "UserFlow", "SEO", "Note"] },
  {
    label: "INFRASTRUCTURE",
    types: ["Integration", "Security", "Cache", "Queue", "Storage", "Group"],
  },
];

let counter = 0;

function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function CanvasToolbar() {
  const addNode = useCanvasStore((s) => s.addNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const { getNodes } = useReactFlow();

  function handleAddBlock(type: BlockType) {
    counter++;
    const x = 250 + (counter % 5) * 50;
    const y = 150 + (counter % 3) * 80;
    addNode(type, { x, y });
  }

  function handleAutoLayout() {
    // Remove old headers
    const oldHeaders = nodes
      .filter((n) => n.type === "Note" && (n.data as { content: string }).content.startsWith("## "))
      .map((n) => n.id);
    for (const id of oldHeaders) deleteNode(id);

    const COL_GAP = 350;
    const ROW_GAP = 50;
    const TYPE_GAP = 80;

    LAYOUT_COLUMNS.forEach((col, colIdx) => {
      const colNodes = nodes.filter(
        (n) => col.types.includes(n.type) && !oldHeaders.includes(n.id),
      );
      if (colNodes.length === 0) return;

      const colX = 150 + colIdx * COL_GAP;
      let y = 120;

      colNodes.sort((a, b) => col.types.indexOf(a.type) - col.types.indexOf(b.type));

      let prevType = "";
      colNodes.forEach((node) => {
        if (prevType && node.type !== prevType) y += TYPE_GAP;
        updateNodePosition(node.id, { x: colX, y });

        const h =
          node.type === "DataModel"
            ? 90 + ((node.data as { fields?: unknown[] }).fields?.length ?? 0) * 28
            : 110;
        y += h + ROW_GAP;
        prevType = node.type;
      });
    });

    toast.success("Backend → Frontend → Infrastructure");
  }

  async function handleExportImage(format: "png" | "svg") {
    const flowNodes = getNodes();
    if (flowNodes.length === 0) {
      toast.error("No blocks to export");
      return;
    }

    const el = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!el) return;

    const padding = 50;
    const bounds = getNodesBounds(flowNodes);
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;
    const viewport = getViewportForBounds(bounds, width, height, 0.5, 2, padding);

    const isDark = document.documentElement.classList.contains("dark");
    const opts = {
      backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
      width,
      height,
      style: {
        width: String(width),
        height: String(height),
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    };

    try {
      if (format === "png") {
        const dataUrl = await toPng(el, opts);
        downloadFile(dataUrl, "architecture.png");
      } else {
        const dataUrl = await toSvg(el, opts);
        downloadFile(dataUrl, "architecture.svg");
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    }
  }

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted">
          <Plus className="h-4 w-4" />
          Add block
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {BLOCK_CATEGORIES.map((cat, catIdx) => (
            <div key={cat.label}>
              {catIdx > 0 && <Separator className="my-1" />}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {cat.label}
              </div>
              {cat.items.map((item) => (
                <DropdownMenuItem
                  key={item.type}
                  onClick={() => handleAddBlock(item.type)}
                  className="gap-2"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleAutoLayout}>
        <LayoutGrid className="h-4 w-4" />
        Auto layout
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted">
          <Image className="h-4 w-4" />
          Export image
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExportImage("png")}>Download PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportImage("svg")}>Download SVG</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
