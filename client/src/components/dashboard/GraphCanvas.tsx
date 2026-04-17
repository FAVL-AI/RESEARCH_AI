"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "paper" | "concept" | "note" | "author";
  val: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  type: string;
}

export const GraphCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const { data: graphData } = useQuery({
    queryKey: ["nodes"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3001/api/nodes");
      // Map basic node IDs to the format expected by D3
      return res.data.nodes.map((id: string) => ({
        id,
        name: id.replace(/_/g, " "),
        type: id.startsWith("arxiv") ? "paper" : "concept",
        val: 15
      }));
    },
    refetchInterval: 3000 // Refresh every 3 seconds for real-time feel
  });

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !graphData) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const nodes: Node[] = graphData;
    const links: Link[] = []; // In a more complex setup, links would come from the backend

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
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => (d as Node).val + 10));

    const link = g.append("g")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (event, d) => setSelectedNode(d));

    // Glow effect
    const filter = svg.append("defs")
      .append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    node.append("circle")
      .attr("r", d => d.val)
      .attr("fill", d => {
        switch(d.type) {
          case 'paper': return '#00ff41';
          case 'concept': return '#00a1ff';
          case 'author': return '#ff00ff';
          default: return '#ffffff';
        }
      })
      .attr("fill-opacity", 0.6)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("filter", "url(#glow)");

    node.append("text")
      .attr("dy", d => d.val + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .text(d => d.name);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
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

  return (
    <div ref={containerRef} className="w-full h-full relative group">
      <svg ref={svgRef} className="w-full h-full cursor-crosshair" />
      
      {/* HUD Info */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-sm">
          <h2 className="text-xs font-mono text-accent mb-1 uppercase tracking-tighter">Current_Node_Network</h2>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold tracking-tighter">{graphData?.length || 0} <span className="text-[10px] text-white/40 font-normal uppercase italic">Nodes</span></div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-2xl font-bold tracking-tighter">0.0k <span className="text-[10px] text-white/40 font-normal uppercase italic">Links</span></div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl transition-transform hover:scale-105">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Search size={18} /></button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomIn size={18} /></button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomOut size={18} /></button>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Maximize size={18} /></button>
        <button className="p-2 bg-accent text-black rounded-full transition-colors"><MousePointer2 size={18} /></button>
      </div>

      {/* Node Preview Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 w-72 bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-lg pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
             <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"
            >
              ×
            </button>
            <div className="text-[10px] font-mono text-accent mb-2 uppercase tracking-widest">{selectedNode.type}</div>
            <h3 className="text-xl font-bold tracking-tight mb-4">{selectedNode.name}</h3>
            
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Concept extraction from research graph. Linked via semantic similarity and agent discovery.
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-white/40 uppercase mb-1">Citations</div>
                <div className="text-xs font-mono">Real-time graph data</div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-accent text-black text-[10px] font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity">Open Paper</button>
                <button className="flex-1 py-2 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm border border-white/10 hover:bg-white/20 transition-colors">Generate Wiki</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
