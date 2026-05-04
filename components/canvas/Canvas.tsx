"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
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
  const addEdge = useCanvasStore((s) => s.addEdge);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);

  const rfNodes: Node[] = storeNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
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

  // Sync store → local state
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
      addEdge(connection.source, connection.target, allowed[0] as ConnectionType);
    },
    [storeNodes, addEdge],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="relative h-full">
      <CanvasToolbar />
      <div className="absolute right-3 top-3 z-10 text-xs text-muted-foreground">
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode="Delete"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
