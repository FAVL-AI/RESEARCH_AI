"use client";

import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Bot, Quote, Zap, ExternalLink, X } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export const CytoscapeCanvas = () => {
  const { graphData, setGraphData, selectedNodeId } = useStore();
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

  const validNodeIds = new Set((nodes || []).map(n => n.id));
  
  const rootNodeId = selectedNodeId || (nodes.length > 0 ? nodes[0].id : null);
  
  // Create an organic particle web if independent files are loaded
  const syntheticLinks = [];
  if (nodes.length > 1 && links.length === 0 && rootNodeId) {
     for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id !== rootNodeId) {
           syntheticLinks.push({ source: rootNodeId, target: nodes[i].id, type: "structural" });
           
           // Organic lateral linkages to create true "spiderweb" rather than star-graph
           if (i > 0 && nodes[i-1].id !== rootNodeId && Math.random() > 0.2) {
               syntheticLinks.push({ source: nodes[i].id, target: nodes[i-1].id, type: "structural_lateral" });
           }
        }
     }
  }

  const mergedLinks = links.length > 0 ? links : syntheticLinks;
  
  const elements = [
    ...(nodes || []).flatMap(n => {
      const isRoot = n.id === rootNodeId;
      const baseNode = {
        data: {
          id: n.id,
          label: n.name || n.id,
          type: n.type,
          score: (n as any).metadata?.score || 1,
          cluster: (n as any).cluster || 0,
          isRoot: isRoot ? "true" : "false"
        },
        classes: isRoot ? "root-node" : `cluster-${(n as any).cluster || 0}`
      };
      return [baseNode];
    }),
    ...(mergedLinks || [])
      .filter((l: any) => {
         const src = typeof l.source === 'string' ? l.source : l.source.id;
         const tgt = typeof l.target === 'string' ? l.target : l.target.id;
         return validNodeIds.has(src) && validNodeIds.has(tgt);
      })
      .map((l: any) => {
        const src = typeof l.source === 'string' ? l.source : l.source.id;
        const tgt = typeof l.target === 'string' ? l.target : l.target.id;
        return {
          data: {
            id: `${src}-${tgt}`,
            source: src,
            target: tgt,
            relationship: l.type || "cites",
            structural: (l.type && l.type.startsWith("structural")) ? "true" : "false"
          },
          classes: (l.type && l.type.startsWith("structural")) ? "structural-edge" : "standard-edge"
        };
      })
  ];

  const stylesheet: any = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "color": "rgba(255,255,255,0.7)",
        "font-size": "10px",
        "font-weight": "500",
        "font-family": "Inter, sans-serif",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": "6px",
        "width": 14,
        "height": 14,
        "border-width": 1,
        "border-color": "rgba(255,255,255,0.2)",
        "background-color": "rgba(255,255,255,0.9)",
        "transition-property": "opacity, background-color, width, height, border-width",
        "transition-duration": "0.3s",
        "opacity": 0.8
      }
    },
    { selector: 'node[cluster = 0]', style: { 'background-color': '#e0f7fa', 'border-color': '#00F5FF' } },
    { selector: 'node[cluster = 1]', style: { 'background-color': '#b3e5fc', 'border-color': '#3b82f6' } },
    { selector: 'node[cluster = 2]', style: { 'background-color': '#e2e8f0', 'border-color': '#94a3b8' } },
    { selector: 'node[cluster = 3]', style: { 'background-color': '#f8fafc', 'border-color': '#cbd5e1' } },
    { selector: 'node[cluster = 4]', style: { 'background-color': '#f1f5f9', 'border-color': '#64748b' } },
    {
      selector: "node[isRoot = 'true']",
      style: {
        "width": 30,
        "height": 30,
        "font-size": "14px",
        "font-weight": "900",
        "color": "#ffffff",
        "background-color": "#ffffff",
        "border-width": 3,
        "border-color": "#00F5FF",
        "border-opacity": 1,
        "underlay-color": "#00F5FF",
        "underlay-padding": 15,
        "underlay-opacity": 0.4
      }
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "transition-property": "opacity, line-color, width",
        "transition-duration": "0.3s"
      }
    },
    {
      selector: "edge[structural = 'true']",
      style: {
        "width": 2,
        "line-color": "#00F5FF",
        "line-style": "dashed",
        "target-arrow-shape": "none",
        "opacity": 0.8
      }
    },
    {
      selector: "edge[structural = 'false']",
      style: {
        "width": 2.5,
        "line-color": "#00F5FF",
        "line-style": "solid",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#00F5FF",
        "opacity": 0.9
      }
    },
    {
      selector: ":selected",
      style: {
        "border-width": 8,
        "border-color": "#00F5FF",
        "border-opacity": 1,
        "underlay-padding": 20,
        "underlay-opacity": 0.8
      }
    },
    {
      selector: ".faded",
      style: {
        "opacity": 0.1,
        "underlay-opacity": 0
      }
    },
    {
      selector: ".highlighted",
      style: {
        "border-color": "#00F5FF",
        "opacity": 1,
        "border-opacity": 1,
        "underlay-opacity": 0.5
      }
    },
    {
      selector: "edge.highlighted",
      style: {
        "opacity": 1,
        "width": 1.5,
        "line-color": "#00F5FF"
      }
    }
  ];

  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      
      cy.on('tap', 'node', (evt: any) => {
        const node = evt.target;
        router.push(`/dashboard/paper/${node.id()}`);
      });

      cy.on('cxttap', 'node', (evt: any) => {
        const node = evt.target;
        const pos = evt.renderedPosition;
        setContextMenu({ x: pos.x, y: pos.y, nodeId: node.id() });
      });

      cy.on('tap', (evt: any) => {
        if (evt.target === cy) setContextMenu(null);
      });

      // Hover Interactive Neighborhood Fading (Litmaps style)
      cy.on('mouseover', 'node', (e: any) => {
        const sel = e.target;
        cy.elements().removeClass('highlighted').addClass('faded');
        sel.removeClass('faded').addClass('highlighted');
        sel.neighborhood().removeClass('faded').addClass('highlighted');
        // also explicitly highlight the root if helpful, but sticking to real neighbors creates a true spiderweb interaction
      });

      cy.on('mouseout', 'node', () => {
        cy.elements().removeClass('faded highlighted');
      });
    }
  }, [router]);

  return (
    <div className="w-full h-full bg-transparent relative overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]" />
      
      <CytoscapeComponent
        key={`${elements.length}-${rootNodeId || "default"}`}
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        stylesheet={stylesheet}
        cy={(cy: any) => { cyRef.current = cy; }}
        layout={{ 
          name: "cose", 
          animate: false,
          nodeRepulsion: function(node: any) { 
             return node.data("isRoot") === "true" ? 8000 : 4000; 
          },
          idealEdgeLength: function(edge: any) { 
             return edge.data("structural") === "true" ? 100 : 150; 
          },
          edgeElasticity: function() { return 0.45; },
          nestingFactor: 1.2,
          gravity: 0.15,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
          padding: 80
        }}
        className="z-10"
      />

      {/* Graph Actions Toolbar */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
         <button 
          onClick={handleCluster}
          disabled={clustering}
          className="px-4 py-2 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black tracking-widest text-black/70 dark:text-white/60 hover:text-accent hover:border-accent/40 transition-all flex items-center gap-2"
         >
           <Bot size={14} className={clustering ? "animate-spin" : ""} />
           {clustering ? "CLUSTERING..." : "IDENTIFY_CLUSTERS"}
         </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <style>{`
            .cytoscape-context-menu { left: ${contextMenu.x}px; top: ${contextMenu.y}px; }
          `}</style>
          <div className="absolute bg-black/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl p-2 z-50 shadow-2xl min-w-[200px] animate-in zoom-in-95 duration-200 cytoscape-context-menu">
          <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1">
             <span className="text-[9px] font-black text-black/60 dark:text-white/40 uppercase tracking-tighter">Node_Intelligence</span>
             <button aria-label="Close Context Menu" onClick={() => setContextMenu(null)}><X size={12} className="text-black/40 dark:text-white/20" /></button>
          </div>
          <button 
            onClick={() => router.push(`/dashboard/paper/${contextMenu.nodeId}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 dark:bg-white/5 rounded-xl text-left transition-colors"
          >
            <ExternalLink size={14} className="text-accent" />
            <span className="text-xs font-bold text-black/80 dark:text-white/80">Open in Reader</span>
          </button>
          <button 
            onClick={async () => {
              const res = await axios.post('http://127.0.0.1:8000/api/agent/summarize', { id: contextMenu.nodeId });
              alert(res.data.summary);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 dark:bg-white/5 rounded-xl text-left transition-colors"
          >
            <Zap size={14} className="text-accent" />
            <span className="text-xs font-bold text-black/80 dark:text-white/80">Analyze & Summarize</span>
          </button>
          <button 
            onClick={async () => {
              const res = await axios.get(`http://127.0.0.1:8000/api/research/cite?id=${contextMenu.nodeId}`);
              alert(res.data.citation);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 dark:bg-white/5 rounded-xl text-left transition-colors"
          >
            <Quote size={14} className="text-accent" />
            <span className="text-xs font-bold text-black/80 dark:text-white/80">Generate Citation</span>
          </button>
        </div>
        </>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 p-4 bg-black/5 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl z-20">
        <div className="flex flex-col gap-2">
           <p className="text-[8px] font-black text-black/40 dark:text-white/20 uppercase tracking-[0.2em] mb-1">Cognitive_Key</p>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00F5FF]" />
                <span className="text-[10px] text-black/60 dark:text-white/40 font-bold">Research_Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[10px] text-black/60 dark:text-white/40 font-bold">Citation_Link</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
