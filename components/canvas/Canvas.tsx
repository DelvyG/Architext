"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  SelectionMode,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
};

const edgeTypes = {
  typed: TypedEdge,
};

type Props = {
  onSave: () => void;
};

export function Canvas({ onSave }: Props) {
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

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);

  const rfNodes: Node[] = storeNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    selected: false,
  }));

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
      setNodes(
        storeNodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
      );
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
      }
    },
    [onNodesChange, updateNodePosition, deleteNode],
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

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: Node) => {
      // Ctrl/Meta+click for multi-select: don't override React Flow's built-in selection
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      selectNode(node.id);
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
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        selectionOnDrag
        panOnDrag={[1]}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Control"
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
