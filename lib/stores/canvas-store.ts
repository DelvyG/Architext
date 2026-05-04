import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  BlockType,
  BlockData,
  CanvasNode,
  CanvasEdge,
  ConnectionType,
} from "@/lib/blocks/schemas";
import { defaultBlockData } from "@/lib/blocks/defaults";
import { getAllowedConnectionTypes } from "@/lib/blocks/connections";

type CanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  projectId: string | null;
};

type CanvasActions = {
  loadCanvas: (projectId: string, nodes: CanvasNode[], edges: CanvasEdge[]) => void;
  addNode: (type: BlockType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<BlockData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (source: string, target: string, type: ConnectionType) => void;
  deleteEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setNodeParent: (nodeId: string, parentId: string | undefined) => void;
  setIsSaving: (saving: boolean) => void;
  setIsDirty: (dirty: boolean) => void;
};

export const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  isSaving: false,
  projectId: null,

  loadCanvas: (projectId, nodes, edges) => {
    set({ projectId, nodes, edges, isDirty: false, selectedNodeId: null });
  },

  addNode: (type, position) => {
    const node: CanvasNode = {
      id: nanoid(),
      type,
      position,
      data: defaultBlockData(type),
    };
    set((state) => ({ nodes: [...state.nodes, node], isDirty: true }));
  },

  updateNode: (id, partialData) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...partialData } as BlockData } : n,
      ),
      isDirty: true,
    }));
  },

  deleteNode: (id) => {
    set((state) => {
      // Unparent children when deleting a group
      const updatedNodes = state.nodes
        .filter((n) => n.id !== id)
        .map((n) => (n.parentId === id ? { ...n, parentId: undefined } : n));
      return {
        nodes: updatedNodes,
        edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        isDirty: true,
      };
    });
  },

  addEdge: (source, target, type) => {
    const state = get();
    const sourceNode = state.nodes.find((n) => n.id === source);
    const targetNode = state.nodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return;

    const allowed = getAllowedConnectionTypes(sourceNode.type, targetNode.type);
    if (!allowed.includes(type)) return;

    const edge: CanvasEdge = {
      id: nanoid(),
      source,
      target,
      type,
    };
    set((state) => ({ edges: [...state.edges, edge], isDirty: true }));
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      isDirty: true,
    }));
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  updateNodePosition: (id, position) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
      isDirty: true,
    }));
  },

  setNodeParent: (nodeId, parentId) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, parentId } : n)),
      isDirty: true,
    }));
  },

  setIsSaving: (saving) => set({ isSaving: saving }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
}));
