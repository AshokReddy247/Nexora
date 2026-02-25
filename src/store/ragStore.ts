import { create } from 'zustand';

export interface RagNode {
    id: string;
    text: string;
    score: number;
    pos: [number, number, number]; // 3D position in graph space
}

export interface RagTrace {
    queryLabel: string;
    nodes: RagNode[];
    latencyMs: number;
    mode: string;
    timestamp: number;
    demo?: boolean;
}

interface RagState {
    activeTrace: RagTrace | null;
    isVisible: boolean;
    setTrace: (trace: RagTrace) => void;
    clearTrace: () => void;
    setVisible: (v: boolean) => void;
}

export const useRagStore = create<RagState>((set) => ({
    activeTrace: null,
    isVisible: false,
    setTrace: (trace) => set({ activeTrace: trace, isVisible: true }),
    clearTrace: () => set({ activeTrace: null, isVisible: false }),
    setVisible: (v) => set({ isVisible: v }),
}));
