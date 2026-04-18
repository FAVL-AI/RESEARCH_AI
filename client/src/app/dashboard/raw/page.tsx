"use client";

import { useEffect, useState } from "react";
import { Database, Code, RefreshCw } from "lucide-react";
import axios from "axios";

export default function RawDataPage() {
  const [nodes, setNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/nodes");
        setNodes(res.data.nodes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-2xl">
            <Database className="text-accent" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Raw_Intelligence_Store</h1>
            <p className="text-white/40 text-sm font-medium tracking-tight">Direct access to the local LanceDB vector store and markdown nodes.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
          <RefreshCw size={14} /> Reindex_DB
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="p-6 border border-white/10 rounded-3xl bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Node_Registry</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-white/20 text-xs animate-pulse">Syncing registry...</div>
              ) : nodes.length === 0 ? (
                <div className="text-white/20 text-xs italic">No nodes found in memory.</div>
              ) : (
                nodes.map(id => (
                  <div key={id} className="p-3 bg-white/2 border border-white/5 rounded-lg text-[10px] font-mono text-white/60 truncate cursor-pointer hover:border-accent/40 transition-colors">
                    {id}.md
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="p-8 border border-white/10 rounded-3xl bg-[#050505] min-h-[500px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Code size={18} className="text-accent" />
              <span className="text-sm font-bold tracking-tight">Object_Inspector</span>
            </div>
            <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 p-6 font-mono text-xs text-green-500/80 leading-relaxed">
              {"// Select a node from the registry to view raw metadata and vector embeddings..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
