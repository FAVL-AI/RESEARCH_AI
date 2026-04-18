"use client";
import React, { useState } from 'react';
import { Compass, Share2, Eye, Download, TrendingUp, Monitor } from 'lucide-react';
import axios from 'axios';
import { useStore } from '@/store/useStore';

export const LitmapsPanel = () => {
  const { nodes, selectedNodeId, activeTrackers, addTracker, removeTracker, addNodeToGraph } = useStore((state) => state);
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [discovery, setDiscovery] = useState<any[]>([]);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [shares, setShares] = useState<string | null>(null);

  const handleDiscover = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/research/discover?topic=${topic || selectedNode?.title || 'machine learning'}`);
      setDiscovery(res.data.recommendations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitor = async (query: string) => {
    if (!query) return;
    try {
      addTracker(query);
      await axios.post('http://127.0.0.1:8000/api/research/monitor', { query });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCanvas = async (nodeData: any) => {
    try {
      // Structure the node for persistence
      const newNode = {
        id: nodeData.paperId ? `s2_${nodeData.paperId}` : `ingest_${Date.now()}`,
        title: nodeData.title,
        content: nodeData.abstract || nodeData.content || "Imported via Literature Discovery.",
        type: "paper",
        metadata: { source: "literature_discovery" }
      };
      
      // Inject to backend
      const res = await axios.post('http://127.0.0.1:8000/api/nodes/create', newNode);
      
      // Hook up to the active interactive Canvas context visually (with a link to the selected Node if present)
      addNodeToGraph(
        { id: newNode.id, name: newNode.title, type: "paper" },
        selectedNodeId || undefined
      );

      // Remove from discovery pool as it is now ingested
      setDiscovery(prev => prev.filter(d => d.title !== nodeData.title));
    } catch (err) {
       console.error("Canvas insertion failed", err);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/research/share', { 
        nodes_count: nodes.length 
      });
      setSnapshotUrl(res.data.snapshot_url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#050505] p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 w-fit">
            <Compass className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black tracking-widest text-accent uppercase">Agentic Literature Engine</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Literature Mapping</h1>
          <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
            Discover related research faster, monitor specific topics across ArXiv automatically, and generate shareable network structures instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Discover Widget */}
          <div className="p-6 bg-black border border-white/10 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Discover</h3>
            <p className="text-xs text-white/40">Find relevant academic papers mapped to your workspace topology.</p>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. quantum computing"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-accent/40 focus:outline-none"
            />
            <button 
              onClick={handleDiscover}
              disabled={loading}
              className="mt-auto px-4 py-2 bg-accent/20 text-accent font-bold text-xs rounded-xl hover:bg-accent/40 transition-colors"
            >
              RUN DISCOVERY
            </button>
          </div>

          {/* Monitor Widget & Active Tracking */}
          <div className="p-6 bg-black border border-white/10 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Monitor className="w-4 h-4 text-accent" /> Active Trackers</h3>
            
            <div className="flex-1 space-y-2 overflow-y-auto max-h-32 pr-2">
              {activeTrackers.length === 0 ? (
                 <p className="text-xs text-white/40 italic">No background sentinels active.</p>
              ) : (
                activeTrackers.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 truncate w-32">{t}</span>
                    </div>
                    <button onClick={() => removeTracker(t)} className="text-[10px] text-white/20 hover:text-red-400 uppercase font-black opacity-0 group-hover:opacity-100 transition-all">Del</button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleMonitor(topic || 'core active focus')}
                  className="w-full px-4 py-2 bg-white/5 font-bold text-[10px] tracking-widest rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  DEPLOY SENTINEL
                </button>
            </div>
          </div>

          {/* Share Widget */}
          <div className="p-6 bg-black border border-white/10 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Share2 className="w-4 h-4 text-accent" /> Share Link</h3>
            <p className="text-xs text-white/40">Generate a live, interactive snapshot link of your active spiderweb to share with your advisors.</p>
            
            {snapshotUrl && (
              <div className="p-3 bg-white/5 border border-accent/20 rounded-lg flex items-center justify-between cursor-pointer group" onClick={() => navigator.clipboard.writeText(snapshotUrl)}>
                 <span className="text-[10px] tracking-wider text-accent font-mono truncate mr-2">{snapshotUrl}</span>
                 <span className="text-[9px] text-white/40 uppercase font-bold group-hover:text-white transition-colors">Copy</span>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-white/5">
                <button 
                  onClick={handleShare}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white/5 font-bold text-[10px] tracking-widest rounded-xl hover:bg-white/10 text-white transition-colors disabled:opacity-50"
                >
                  {loading ? "GENERATING..." : "GENERATE SNAPSHOT"}
                </button>
            </div>
          </div>
          
          {/* Visualize Widget */}
          <div className="p-6 bg-black border border-white/10 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /> Visualize</h3>
            <p className="text-xs text-white/40">Switch to the birds-eye organic particle view to map structural intersections.</p>
            <div className="mt-auto pt-4 border-t border-white/5">
                <a href="/dashboard" className="w-full h-8 flex items-center justify-center bg-white/5 font-bold text-xs rounded-xl hover:bg-white/10 text-white transition-colors">
                  OPEN CANVAS
                </a>
            </div>
          </div>
        </div>

        {/* Discovery Results */}
        {discovery.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-black tracking-widest text-white/40 uppercase mb-4">Discovery Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discovery.map((d, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                  <h4 className="text-sm font-bold text-white/80 line-clamp-2">{d.title}</h4>
                  <p className="text-xs text-white/40 mt-2 line-clamp-3 leading-relaxed">{d.abstract || d.content}</p>
                  <button 
                    onClick={() => handleAddToCanvas(d)}
                    className="mt-5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-[10px] uppercase font-black text-accent tracking-wider hover:bg-accent hover:text-black transition-colors w-min whitespace-nowrap"
                  >
                    ADD TO CANVAS
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
