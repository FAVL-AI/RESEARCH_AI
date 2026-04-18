import { create } from 'zustand';

interface Node {
  id: string;
  name: string;
  type: 'paper' | 'concept' | 'note';
  val: number;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface AppState {
  graphData: GraphData;
  selectedNodeId: string | null;
  papers: any[];
  isLoading: boolean;
  logs: any[];
  researchMode: 'fast' | 'deep';
  activeSources: any[];
  studioArtifacts: any[];
  
  // Actions
  setGraphData: (data: GraphData) => void;
  addNodes: (nodes: Node[]) => void;
  addLinks: (links: Link[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setPapers: (papers: any[]) => void;
  setIsLoading: (loading: boolean) => void;
  addLog: (log: any) => void;
  clearLogs: () => void;
  clearStudioArtifacts: () => void;
  setResearchMode: (mode: 'fast' | 'deep') => void;
  setActiveSources: (sources: any[]) => void;
  addStudioArtifact: (artifact: any) => void;
}

export const useStore = create<AppState>((set) => ({
  graphData: { nodes: [], links: [] },
  selectedNodeId: null,
  papers: [],
  isLoading: false,
  logs: [],
  researchMode: 'fast',
  activeSources: [],
  studioArtifacts: [],

  setGraphData: (data) => set({ graphData: data }),
  setResearchMode: (mode) => set({ researchMode: mode }),
  setActiveSources: (sources) => set({ activeSources: sources }),
  addStudioArtifact: (art) => set((s) => ({ studioArtifacts: [art, ...s.studioArtifacts] })),
  
  addNodes: (newNodes) => set((state) => {
    const existingNodes = new Map(state.graphData.nodes.map(n => [n.id, n]));
    
    newNodes.forEach(node => {
      // Scale radius by score if present (Influence Ranking)
      const score = (node as any).metadata?.score || 0;
      const radius = 15 + Math.min(20, Math.log1p(score) * 4);
      
      existingNodes.set(node.id, {
        ...node,
        val: radius
      });
    });

    return {
      graphData: {
        ...state.graphData,
        nodes: Array.from(existingNodes.values())
      }
    };
  }),

  addLinks: (newLinks) => set((state) => {
    const linkKeys = new Set(state.graphData.links.map(l => `${l.source}-${l.target}`));
    const uniqueLinks = newLinks.filter(l => !linkKeys.has(`${l.source}-${l.target}`));
    
    return {
      graphData: {
        ...state.graphData,
        links: [...state.graphData.links, ...uniqueLinks]
      }
    };
  }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setPapers: (papers) => set({ papers }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  addLog: (log) => set((state) => ({ 
    logs: [log, ...state.logs].slice(0, 100) // Keep last 100 logs
  })),
  clearLogs: () => set({ logs: [] }),
  clearStudioArtifacts: () => set({ studioArtifacts: [] }),
}));
