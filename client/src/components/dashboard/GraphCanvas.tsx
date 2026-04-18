"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Search, ZoomIn, ZoomOut, Maximize, MousePointer2, Box, Sliders, Brain, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  val: number;
  cluster?: number;
  metadata?: any;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type?: string;
}

export const GraphCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  
  const { 
    graphData, 
    setGraphData, 
    selectedNodeId, 
    setSelectedNodeId,
    isLoading 
  } = useStore();

  const [localSelectedNode, setLocalSelectedNode] = useState<Node | null>(null);

  // Sync React Query data with Store
  const { data: remoteData } = useQuery({
    queryKey: ["nodes"],
    queryFn: async () => {
      const res = await axios.get("http://127.0.0.1:8000/api/nodes");
      return res.data.nodes.map((id: string) => ({
        id,
        name: id.replace(/_/g, " ").replace("arxiv ", ""),
        type: id.startsWith("arxiv") ? "paper" : "concept",
        val: 15
      }));
    },
    refetchInterval: 5000
  });

  useEffect(() => {
    if (remoteData && graphData.nodes.length === 0) {
      setGraphData({ nodes: remoteData, links: [] });
    }
  }, [remoteData]);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || graphData.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Deep clone to prevent D3 from mutating React state in Strict Mode
    const nodes: any[] = graphData.nodes.map(n => ({ ...n }));
    const nodeIds = new Set(nodes.map(n => n.id));

    const links: any[] = graphData.links
      .filter(l => {
        const srcId = typeof l.source === 'object' ? l.source.id : l.source;
        const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
        return nodeIds.has(srcId) && nodeIds.has(tgtId);
      })
      .map(l => ({ 
        ...l,
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target
      }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => (d as Node).val + 20));

    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => {
        switch(d.type) {
          case 'contradicts': return '#ff0033'; // Deep Red
          case 'supports': return '#00ff41';    // Neon Green
          case 'cites': return 'rgba(255, 255, 255, 0.2)'; // Faint White
          default: return 'rgba(255, 255, 255, 0.1)';
        }
      })
      .attr("stroke-width", d => d.type === 'cites' ? 1 : 2)
      .attr("stroke-dasharray", d => d.type === 'contradicts' ? "4,4" : "0");

    // Heatmap Layer (Subtle Density Background)
    const heatmap = g.append("g")
      .attr("class", "heatmap")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 150)
      .attr("fill", "url(#heatmapGradient)")
      .attr("opacity", 0.05);

    // Filter/Glow Definitions
    const defs = svg.append("defs");
    
    // Heatmap Gradient
    const radialGradient = defs.append("radialGradient").attr("id", "heatmapGradient");
    radialGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(0, 255, 65, 0.3)");
    radialGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0, 0, 0, 0)");

    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (event, d) => {
        setLocalSelectedNode(d);
        setSelectedNodeId(d.id);
      });

    // Color Scales for Clusters
    const clusterColors = [
      '#00ff41', // Matrix Green (General)
      '#00a1ff', // Electric Blue (Topic A)
      '#ff00ff', // Cyber Purple (Topic B)
      '#ffcc00', // Gold (Topic C)
      '#ff3300'  // Red (Alert)
    ];

    node.append("circle")
      .attr("r", d => d.val)
      .attr("fill", d => {
        // If clustered, use cluster color, otherwise default by type
        if (d.cluster !== undefined && d.cluster < clusterColors.length) {
          return clusterColors[d.cluster];
        }
        switch(d.type) {
          case 'paper': return '#00ff41';
          case 'concept': return '#00a1ff';
          default: return '#ffffff';
        }
      })
      .attr("fill-opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)");

    node.append("text")
      .attr("dy", d => d.val + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("font-family", "Inter, sans-serif")
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + "..." : d.name);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
      
      heatmap
        .attr("cx", d => (d as any).x)
        .attr("cy", d => (d as any).y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [graphData]);

  const handleOpenPaper = () => {
    if (localSelectedNode) {
      router.push(`/dashboard/paper/${localSelectedNode.id}`);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative group bg-black/20">
      <svg ref={svgRef} className="w-full h-full cursor-crosshair" />
      
      {/* HUD Info */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-5 rounded-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <h2 className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">Cognitive_Network_v1.0</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter tabular-nums">{(graphData.nodes || []).length}</span>
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Active_Nodes</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter tabular-nums">{(graphData.links || []).length}</span>
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Neural_links</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 p-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:border-white/20">
        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white" title="Search"><Search size={20} /></button>
        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white" title="Zoom In"><ZoomIn size={20} /></button>
        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white" title="Zoom Out"><ZoomOut size={20} /></button>
        <div className="w-[1px] h-5 bg-white/10 mx-1" />
        
        {/* Topic Discovery Button */}
        <button 
          onClick={async () => {
             const nodeIds = graphData.nodes.map(n => n.id);
             if (nodeIds.length < 2) return;
             try {
                const res = await axios.post('http://127.0.0.1:8000/api/agent/cluster', { node_ids: nodeIds });
                setGraphData({ nodes: res.data.nodes, links: graphData.links });
             } catch (err) {
                console.error("Clustering failed", err);
             }
          }}
          className="p-2.5 hover:bg-accent/20 rounded-xl transition-all text-accent group flex items-center gap-2" 
          title="Run Topic Discovery"
        >
          <Sliders size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all">Topic_Discovery</span>
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Autonomous Loop Button */}
        <button 
          onClick={async () => {
             const query = prompt("Enter research seed (e.g., 'Quantum Error Correction'):");
             if (!query) return;
             try {
                const res = await axios.post('http://127.0.0.1:8000/api/agent/run', { query });
                setGraphData({ nodes: res.data.nodes, links: res.data.links });
                alert(res.data.summary);
             } catch (err) {
                console.error("Autonomous loop failed", err);
             }
          }}
          className="p-2.5 bg-accent/20 border border-accent/20 rounded-xl text-accent hover:bg-accent hover:text-black transition-all flex items-center gap-2 group"
          title="Autonomous Deep Research"
        >
          <Brain size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all">AUTONOMOUS_RUN</span>
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />
        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white" title="Maximize"><Maximize size={20} /></button>
        <button className="p-2.5 bg-accent text-black rounded-xl shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] hover:scale-110 active:scale-95 transition-all"><MousePointer2 size={20} /></button>
      </div>

      {/* Node Preview Detail Panel */}
      <AnimatePresence>
        {localSelectedNode && (
          <motion.div 
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className="absolute top-8 right-8 w-80 bg-black/60 backdrop-blur-3xl border border-white/10 p-7 rounded-2xl pointer-events-auto shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Background Accent Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

             <button 
              onClick={() => setLocalSelectedNode(null)}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <Maximize size={18} className="rotate-45" />
            </button>

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
                  localSelectedNode.type === 'paper' ? "text-accent bg-accent" : "text-blue-400 bg-blue-400"
                )} />
                <div className="text-[9px] font-black font-mono text-white/40 uppercase tracking-[0.3em]">{localSelectedNode.type}</div>
              </div>
              
              <h3 className="text-xl font-black tracking-tight leading-tight mb-4 group-hover:text-accent transition-colors">{localSelectedNode.name}</h3>
              
              <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent mb-5" />

              <p className="text-xs text-white/50 leading-relaxed mb-8 font-medium italic">
                {localSelectedNode.type === 'paper' 
                  ? "Research node identified via agentic search. High semantic relevance to core project nodes."
                  : "Conceptual entity distilled from research lineages and cross-referenced with local knowledge."}
              </p>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <button 
                    onClick={handleOpenPaper}
                    className="flex-1 py-3 bg-accent text-black text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:opacity-90 shadow-[0_10px_20px_rgba(var(--accent-rgb),0.2)] transition-all active:scale-95"
                  >
                    Open Paper
                  </button>
                  <button className="flex items-center justify-center w-12 h-12 bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                    <Box size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
