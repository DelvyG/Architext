"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  SelectionMode,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import { getAllowedConnectionTypes, getConnectionHint } from "@/lib/blocks/connections";
import type { BlockType, ConnectionType } from "@/lib/blocks/schemas";
import { defaultBlockData } from "@/lib/blocks/defaults";
import { DataModelNode } from "./nodes/DataModelNode";
import { EndpointNode } from "./nodes/EndpointNode";
import { ViewNode } from "./nodes/ViewNode";
import { IntegrationNode } from "./nodes/IntegrationNode";
import { UserFlowNode } from "./nodes/UserFlowNode";
import { AuthNode } from "./nodes/AuthNode";
import { JobNode } from "./nodes/JobNode";
import { NoteNode } from "./nodes/NoteNode";
import { SecurityNode } from "./nodes/SecurityNode";
import { CacheNode } from "./nodes/CacheNode";
import { QueueNode } from "./nodes/QueueNode";
import { StorageNode } from "./nodes/StorageNode";
import { SEONode } from "./nodes/SEONode";
import { GroupNode } from "./nodes/GroupNode";
import { TypedEdge } from "./edges/TypedEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { ContextMenu } from "./ContextMenu";
import { toast } from "sonner";

const nodeTypes = {
  DataModel: DataModelNode,
  Endpoint: EndpointNode,
  View: ViewNode,
  Integration: IntegrationNode,
  UserFlow: UserFlowNode,
  Auth: AuthNode,
  Job: JobNode,
  Note: NoteNode,
  Security: SecurityNode,
  Cache: CacheNode,
  Queue: QueueNode,
  Storage: StorageNode,
  SEO: SEONode,
  Group: GroupNode,
};

const edgeTypes = {
  typed: TypedEdge,
};

type Props = {
  onSave: () => void;
};

export function Canvas({ onSave }: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner onSave={onSave} />
    </ReactFlowProvider>
  );
}

function CanvasInner({ onSave }: Props) {
  const storeNodes = useCanvasStore((s) => s.nodes);
  const storeEdges = useCanvasStore((s) => s.edges);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const isSaving = useCanvasStore((s) => s.isSaving);
  const selectNode = useCanvasStore((s) => s.selectNode);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);
  const storeAddEdge = useCanvasStore((s) => s.addEdge);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);
  const addNode = useCanvasStore((s) => s.addNode);
  const setNodeParent = useCanvasStore((s) => s.setNodeParent);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);

  function mapToRfNodes(list: typeof storeNodes): Node[] {
    // Groups must come before their children for React Flow
    const sorted = [...list].sort((a, b) => {
      if (a.type === "Group" && b.type !== "Group") return -1;
      if (a.type !== "Group" && b.type === "Group") return 1;
      return 0;
    });

    return sorted.map((n) => {
      const base: Node = {
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      };
      if (n.parentId) {
        base.parentId = n.parentId;
      }
      if (n.type === "Group") {
        const gd = n.data as { width?: number; height?: number };
        base.style = { width: gd.width ?? 400, height: gd.height ?? 300 };
        base.dragHandle = ".group-drag-handle";
        base.zIndex = -1;
      }
      return base;
    });
  }

  const rfNodes: Node[] = mapToRfNodes(storeNodes);

  const rfEdges: Edge[] = storeEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "typed",
    data: { type: e.type },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const prevNodesRef = useRef(storeNodes);
  const prevEdgesRef = useRef(storeEdges);

  useEffect(() => {
    if (prevNodesRef.current !== storeNodes) {
      setNodes(mapToRfNodes(storeNodes));
      prevNodesRef.current = storeNodes;
    }
  }, [storeNodes, setNodes]);

  useEffect(() => {
    if (prevEdgesRef.current !== storeEdges) {
      setEdges(
        storeEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: "typed",
          data: { type: e.type },
        })),
      );
      prevEdgesRef.current = storeEdges;
    }
  }, [storeEdges, setEdges]);

  // Debounced save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (isDirty) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(onSave, 800);
    }
    return () => clearTimeout(saveTimerRef.current);
  }, [isDirty, onSave, storeNodes, storeEdges]);

  // Keyboard shortcuts for canvas
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Delete/Backspace to remove selected nodes
      if (e.key === "Delete" || e.key === "Backspace") {
        // Don't delete if typing in an input
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

        const selectedNodes = nodes.filter((n) => n.selected);
        const selectedEdges = edges.filter((ed) => ed.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault();
          for (const n of selectedNodes) deleteNode(n.id);
          for (const ed of selectedEdges) deleteEdge(ed.id);
          if (selectedNodes.length > 0) {
            toast.success(
              `Deleted ${selectedNodes.length} block${selectedNodes.length > 1 ? "s" : ""}`,
            );
          }
        }
      }

      // Ctrl+A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, deleteNode, deleteEdge, setNodes]);

  const updateNode = useCanvasStore((s) => s.updateNode);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position);
        }
        if (change.type === "remove") {
          deleteNode(change.id);
        }
        // Persist group resize
        if (change.type === "dimensions" && change.dimensions) {
          const node = storeNodes.find((n) => n.id === change.id);
          if (node?.type === "Group") {
            updateNode(change.id, {
              width: change.dimensions.width,
              height: change.dimensions.height,
            });
          }
        }
      }
    },
    [onNodesChange, updateNodePosition, deleteNode, updateNode, storeNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      for (const change of changes) {
        if (change.type === "remove") {
          deleteEdge(change.id);
        }
      }
    },
    [onEdgesChange, deleteEdge],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = storeNodes.find((n) => n.id === connection.source);
      const targetNode = storeNodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return;

      const allowed = getAllowedConnectionTypes(
        sourceNode.type as BlockType,
        targetNode.type as BlockType,
      );
      if (allowed.length === 0) {
        const hint = getConnectionHint(sourceNode.type as BlockType, targetNode.type as BlockType);
        toast.error(`Cannot connect ${sourceNode.type} → ${targetNode.type}`, {
          description: hint,
          duration: 5000,
        });
        return;
      }
      storeAddEdge(connection.source, connection.target, allowed[0] as ConnectionType);
    },
    [storeNodes, storeAddEdge],
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      // Sync React Flow selection → Zustand store (for inspector)
      if (selectedNodes.length === 1 && selectedNodes[0]) {
        selectNode(selectedNodes[0].id);
      } else if (selectedNodes.length === 0) {
        selectNode(null);
      }
      // When multiple selected, keep the last one in inspector
      if (selectedNodes.length > 1) {
        const last = selectedNodes[selectedNodes.length - 1];
        if (last) selectNode(last.id);
      }
    },
    [selectNode],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    setContextMenu(null);
  }, [selectNode]);

  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      selectNode(node.id);
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
    },
    [selectNode],
  );

  const handlePaneContextMenu = useCallback((e: MouseEvent | React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      // Skip if the dragged node is a Group itself
      if (draggedNode.type === "Group") return;

      // Find all group nodes
      const groupNodes = nodes.filter((n) => n.type === "Group");

      // Check if the dragged node's center is inside any group
      const draggedCenterX = draggedNode.position.x + 90;
      const draggedCenterY = draggedNode.position.y + 30;

      let targetGroup: Node | undefined;
      for (const group of groupNodes) {
        const gw = (group.style?.width as number) ?? 400;
        const gh = (group.style?.height as number) ?? 300;
        if (
          draggedCenterX > group.position.x &&
          draggedCenterX < group.position.x + gw &&
          draggedCenterY > group.position.y &&
          draggedCenterY < group.position.y + gh
        ) {
          targetGroup = group;
          break;
        }
      }

      const currentParent = storeNodes.find((n) => n.id === draggedNode.id)?.parentId;

      if (targetGroup && targetGroup.id !== currentParent) {
        // Convert position to relative to group
        const relX = draggedNode.position.x - targetGroup.position.x;
        const relY = draggedNode.position.y - targetGroup.position.y;
        updateNodePosition(draggedNode.id, { x: Math.max(10, relX), y: Math.max(30, relY) });
        setNodeParent(draggedNode.id, targetGroup.id);
        toast.success(`Added to ${(targetGroup.data as { name?: string }).name ?? "group"}`);
      } else if (!targetGroup && currentParent) {
        // Dragged out of a group — unparent
        const parentNode = nodes.find((n) => n.id === currentParent);
        if (parentNode) {
          const absX = parentNode.position.x + draggedNode.position.x;
          const absY = parentNode.position.y + draggedNode.position.y;
          setNodeParent(draggedNode.id, undefined);
          updateNodePosition(draggedNode.id, { x: absX, y: absY });
          toast.success("Removed from group");
        }
      }
    },
    [nodes, storeNodes, updateNodePosition, setNodeParent],
  );

  function handleContextAction(action: string) {
    if (!contextMenu) return;

    if (action === "delete" && contextMenu.nodeId) {
      deleteNode(contextMenu.nodeId);
      toast.success("Block deleted");
    }

    if (action === "duplicate" && contextMenu.nodeId) {
      const original = storeNodes.find((n) => n.id === contextMenu.nodeId);
      if (original) {
        addNode(original.type, {
          x: original.position.x + 50,
          y: original.position.y + 50,
        });
        // Copy the data to the new node
        const newNode = useCanvasStore.getState().nodes.at(-1);
        if (newNode) {
          useCanvasStore.getState().updateNode(newNode.id, { ...original.data });
        }
        toast.success("Block duplicated");
      }
    }

    if (action === "delete-selected") {
      const selected = nodes.filter((n) => n.selected);
      for (const n of selected) deleteNode(n.id);
      toast.success(`Deleted ${selected.length} blocks`);
    }

    setContextMenu(null);
  }

  const selectedCount = nodes.filter((n) => n.selected).length;

  return (
    <div className="relative h-full">
      <CanvasToolbar />
      <div className="absolute right-3 top-3 z-10 flex items-center gap-3 text-xs text-muted-foreground">
        {selectedCount > 1 && (
          <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">
            {selectedCount} selected
          </span>
        )}
        {isSaving ? "Saving..." : isDirty ? "Unsaved changes" : "All changes saved"}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={handleSelectionChange}
        onPaneClick={handlePaneClick}
        onNodeDragStop={handleNodeDragStop}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        selectionOnDrag
        panOnDrag={[1]}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          selectedCount={selectedCount}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
