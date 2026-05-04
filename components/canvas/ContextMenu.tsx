"use client";

import { useEffect, useRef } from "react";
import { Copy, Trash2, TrashIcon } from "lucide-react";

type Props = {
  x: number;
  y: number;
  nodeId?: string;
  selectedCount: number;
  onAction: (action: string) => void;
  onClose: () => void;
};

export function ContextMenu({ x, y, nodeId, selectedCount, onAction, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] rounded-md border bg-popover p-1 shadow-md"
      style={{ left: x, top: y }}
    >
      {nodeId && (
        <>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            onClick={() => onAction("duplicate")}
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            onClick={() => onAction("delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </>
      )}
      {selectedCount > 1 && (
        <>
          {nodeId && <div className="my-1 h-px bg-border" />}
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            onClick={() => onAction("delete-selected")}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Delete {selectedCount} selected
          </button>
        </>
      )}
      {!nodeId && selectedCount <= 1 && (
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Right-click a block for options
        </div>
      )}
    </div>
  );
}
