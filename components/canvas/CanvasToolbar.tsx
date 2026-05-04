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
} from "lucide-react";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { BlockType } from "@/lib/blocks/schemas";
import { toast } from "sonner";

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

export function CanvasToolbar() {
  const addNode = useCanvasStore((s) => s.addNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);

  function handleAddBlock(type: BlockType) {
    counter++;
    const x = 250 + (counter % 5) * 50;
    const y = 150 + (counter % 3) * 80;
    addNode(type, { x, y });
  }

  function handleAutoLayout() {
    const COL_WIDTH = 320;
    const ROW_GAP = 20;
    const COL_GAP = 80;
    const START_Y = 60;

    LAYOUT_COLUMNS.forEach((col, colIdx) => {
      const colNodes = nodes.filter((n) => col.types.includes(n.type));
      if (colNodes.length === 0) return;

      const colX = 60 + colIdx * (COL_WIDTH + COL_GAP);
      let currentY = START_Y;

      // Sort: DataModels first, then by type order
      colNodes.sort((a, b) => {
        const ai = col.types.indexOf(a.type);
        const bi = col.types.indexOf(b.type);
        return ai - bi;
      });

      // Place nodes in this column
      let prevType = "";
      colNodes.forEach((node) => {
        // Add extra gap between different block types
        if (prevType && node.type !== prevType) {
          currentY += 30;
        }
        updateNodePosition(node.id, { x: colX, y: currentY });

        const h =
          node.type === "DataModel"
            ? 70 + ((node.data as { fields?: unknown[] }).fields?.length ?? 0) * 28
            : 90;
        currentY += h + ROW_GAP;
        prevType = node.type;
      });
    });

    toast.success("Organized: Backend → Frontend → Infrastructure");
  }

  return (
    <div className="absolute left-3 top-3 z-10 flex gap-2">
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
    </div>
  );
}
