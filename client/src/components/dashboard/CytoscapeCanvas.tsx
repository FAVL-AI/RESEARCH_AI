"use client";

import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Bot, Quote, Zap, ExternalLink, X } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export const CytoscapeCanvas = () => {
  const { graphData, setGraphData } = useStore();
  const { nodes, links } = graphData;
  const router = useRouter();
  const cyRef = useRef<any>(null);
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
  const [clustering, setClustering] = useState(false);

  const handleCluster = async () => {
    setClustering(true);
    try {
      const nodeIds = nodes.map(n => n.id);
      const res = await axios.post('http://127.0.0.1:8000/api/agent/cluster', { node_ids: nodeIds });
      // Update nodes with cluster data
      const updatedNodes = nodes.map(n => {
        const found = res.data.nodes.find((rn: any) => rn.id === n.id);
        return found ? { ...n, cluster: found.cluster } : n;
      });
      setGraphData({ nodes: updatedNodes, links });
    } catch (err) {
      console.error("Clustering failed:", err);
    } finally {
      setClustering(false);
    }
  };

  const elements = [
    ...(nodes || []).flatMap(n => {
      const baseNode = {
        data: {
          id: n.id,
          label: n.name || n.id,
          type: n.type,
          score: (n as any).metadata?.score || 1,
          cluster: (n as any).cluster || 0
        }
      };
      return [baseNode];
    }),
    ...(links || []).map(l => ({
      data: {
        source: typeof l.source === 'string' ? l.source : (l.source as any).id,
        target: typeof l.target === 'string' ? l.target : (l.target as any).id,
        relationship: (l as any).type || "cites"
      }
    }))
  ];

  const stylesheet: any = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "color": "#fff",
        "font-size": "8px",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": "4px",
        "background-color": (ele: any) => {
          const cluster = ele.data("cluster") || 0;
          const colors = ["#00F5FF", "#FF00E5", "#00FF41", "#FFD700", "#FF4500"];
          return colors[cluster % colors.length];
        },
        "width": (ele: any) => {
          const score = ele.data("score") || 1;
          return 25 + Math.min(30, Math.log1p(score) * 10);
        },
        "height": (ele: any) => {
          const score = ele.data("score") || 1;
          return 25 + Math.min(30, Math.log1p(score) * 10);
        },
        "border-width": 2,
        "border-color": "#fff",
        "border-opacity": 0.1,
        "ghost": "yes",
        "ghost-offset-y": 2,
        "ghost-opacity": 0.1,
        "transition-property": "background-color, width, height",
        "transition-duration": "0.3s"
      }
    },
    {
      selector: "edge",
      style: {
        "width": 1,
        "line-color": "#222",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#222",
        "opacity": 0.3
      }
    },
    {
      selector: ":selected",
      style: {
        "border-width": 4,
        "border-color": "#00F5FF",
        "border-opacity": 0.8
      }
    }
  ];

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on('tap', 'node', (evt: any) => {
        const node = evt.target;
        router.push(`/dashboard/paper/${node.id()}`);
      });

      cyRef.current.on('cxttap', 'node', (evt: any) => {
        const node = evt.target;
        const pos = evt.renderedPosition;
        setContextMenu({ x: pos.x, y: pos.y, nodeId: node.id() });
      });

      cyRef.current.on('tap', (evt: any) => {
        if (evt.target === cyRef.current) setContextMenu(null);
      });
    }
  }, [router]);

  return (
    <div className="w-full h-full bg-[#030303] relative overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        stylesheet={stylesheet}
        cy={(cy) => { cyRef.current = cy; }}
        layout={{ 
          name: "cose", 
          animate: true,
          nodeOverlap: 20,
          refresh: 20,
          componentSpacing: 80,
          nodeRepulsion: 4000
        }}
        className="z-10"
      />

      {/* Graph Actions Toolbar */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
         <button 
          onClick={handleCluster}
          disabled={clustering}
          className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-white/60 hover:text-accent hover:border-accent/40 transition-all flex items-center gap-2"
         >
           <Bot size={14} className={clustering ? "animate-spin" : ""} />
           {clustering ? "CLUSTERING..." : "IDENTIFY_CLUSTERS"}
         </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="absolute bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 shadow-2xl min-w-[200px] animate-in zoom-in-95 duration-200"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-1">
             <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Node_Intelligence</span>
             <button onClick={() => setContextMenu(null)}><X size={12} className="text-white/20" /></button>
          </div>
          <button 
            onClick={() => router.push(`/dashboard/paper/${contextMenu.nodeId}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-left transition-colors"
          >
            <ExternalLink size={14} className="text-accent" />
            <span className="text-xs font-bold text-white/80">Open in Reader</span>
          </button>
          <button 
            onClick={async () => {
              const res = await axios.post('http://127.0.0.1:8000/api/agent/summarize', { id: contextMenu.nodeId });
              alert(res.data.summary);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-left transition-colors"
          >
            <Zap size={14} className="text-accent" />
            <span className="text-xs font-bold text-white/80">Analyze & Summarize</span>
          </button>
          <button 
            onClick={async () => {
              const res = await axios.get(`http://127.0.0.1:8000/api/research/cite?id=${contextMenu.nodeId}`);
              alert(res.data.citation);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-left transition-colors"
          >
            <Quote size={14} className="text-accent" />
            <span className="text-xs font-bold text-white/80">Generate Citation</span>
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl z-20">
        <div className="flex flex-col gap-2">
           <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Cognitive_Key</p>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00F5FF]" />
                <span className="text-[10px] text-white/40 font-bold">Research_Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/40 font-bold">Citation_Link</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
