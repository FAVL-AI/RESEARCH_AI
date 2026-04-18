"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Download, Maximize2, GitBranch, ExternalLink, Quote, FileText, Globe, Bot, Zap, ArrowRight, ChevronDown } from "lucide-react";
import axios from "axios";
import { CitationModal } from "@/components/dashboard/CitationModal";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-white mt-6 mb-4 leading-tight tracking-tight">{line.replace('# ', '')}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-5 mb-3">{line.replace('## ', '')}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-md font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc mb-1 text-white/70">{line.replace('- ', '')}</li>;
    if (line.trim() === '') return <div key={i} className="h-4" />;
    return <p key={i} className="mb-2 text-white/70 leading-relaxed font-sans">{line}</p>;
  });
};

export default function PaperPage() {
  const { id } = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanding, setExpanding] = useState(false);
  const { addNodes, addLinks } = useStore();

  const [citationModal, setCitationModal] = useState({ open: false, text: "", style: "apa" });
  const [resolving, setResolving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/nodes/${id}`);
        setPaper(res.data);
      } catch (err) {
        console.error("Failed to fetch paper:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleExpand = async () => {
    if (expanding) return;
    setExpanding(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/agent/expand`, { id });
      const { new_nodes, links } = res.data;
      
      const formattedNodes = new_nodes.map((n: any) => ({
        id: n.id,
        name: n.title,
        type: n.type,
        val: 12
      }));
      
      addNodes(formattedNodes);
      addLinks(links);
    } catch (err) {
      console.error("Expansion failed:", err);
    } finally {
      setExpanding(false);
    }
  };

  const handleCite = async (style: string) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/research/cite?id=${id}&style=${style}`);
      setCitationModal({ open: true, text: res.data.citation, style });
    } catch (err) {
      console.error("Citation failed:", err);
    }
  };

  const handleResolve = async () => {
    if (resolving) return;
    setResolving(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/research/resolve`, { 
        title: paper.title,
        doi: paper.metadata?.doi 
      });
      if (res.data.url) {
        window.open(res.data.url, "_blank");
      }
    } catch (err) {
      console.error("Resolution failed:", err);
      alert("Could not resolve primary DOI link for this paper.");
    } finally {
      setResolving(false);
    }
  };

  const handleExport = async (format: string) => {
    setExporting(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/research/export`, { id, format });
      window.open(`http://127.0.0.1:8000${res.data.url}`, "_blank");
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!paper) return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-white/40">Paper not found</h1>
      <button onClick={() => router.back()} className="text-accent underline">Go back</button>
    </div>
  );

  const arxivId = id.toString().replace("arxiv_", "");

  return (
    <div className="flex h-full flex-col bg-[#050505] animate-in fade-in duration-500">
      {/* Top Header */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold truncate max-w-[400px]">{paper.title}</h1>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExpand}
            disabled={expanding}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-xs font-bold text-accent hover:bg-accent hover:text-black transition-all",
              expanding && "opacity-50 cursor-wait"
            )}
          >
            <GitBranch size={14} className={cn(expanding && "animate-spin")} />
            {expanding ? "EXPANDING..." : "EXPAND LINEAGE"}
          </button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60"><Share2 size={18} /></button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60"><Download size={18} /></button>
        </div>
      </header>

      {/* Split Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Metadata Panel */}
        <div className="w-1/3 border-r border-white/5 p-8 overflow-y-auto no-scrollbar space-y-8 bg-[#080808]">
          
          {/* Intelligence Actions */}
          <section className="p-6 bg-accent/5 border border-accent/20 rounded-2xl space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-accent" />
                <h2 className="text-[10px] font-black tracking-widest text-accent uppercase">Intelligence_Layer</h2>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={async () => {
                  setActionLoading('summarize');
                  try {
                    const res = await axios.post('http://127.0.0.1:8000/api/agent/summarize', { id });
                    alert(res.data.summary || "Summary generation completed.");
                  } catch (err) {
                    alert("Failed to summarize this node.");
                  } finally {
                    setActionLoading(null);
                  }
                }}
                disabled={actionLoading !== null}
                className={cn(
                  "py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2",
                  actionLoading === 'summarize' && "opacity-50 cursor-wait"
                )}
               >
                  <Zap size={14} className={cn("text-accent", actionLoading === 'summarize' && "animate-spin")} />
                  {actionLoading === 'summarize' ? "SUMMARIZING..." : "SUMMARIZE"}
               </button>

               <button 
                onClick={async () => {
                  setActionLoading('reproduce');
                  try {
                    const res = await axios.post('http://127.0.0.1:8000/api/agent/reproduce', { id });
                    alert(`GITHUB REPOS: ${JSON.stringify(res.data.repositories)}\n\nPLAN: ${res.data.plan}`);
                  } catch (err) {
                    alert("Failed to build reproduction plan.");
                  } finally {
                    setActionLoading(null);
                  }
                }}
                disabled={actionLoading !== null}
                className={cn(
                  "py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2",
                  actionLoading === 'reproduce' && "opacity-50 cursor-wait"
                )}
               >
                  <GitBranch size={14} className={cn("text-accent", actionLoading === 'reproduce' && "animate-spin")} />
                  {actionLoading === 'reproduce' ? "BUILDING PLAN..." : "REPRO_PLAN"}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => {
                     setActionLoading('cite');
                     handleCite("apa").finally(() => setActionLoading(null));
                  }}
                  disabled={actionLoading !== null}
                  className={cn(
                    "py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-bold hover:bg-cyan-500/20 text-cyan-400 transition-all flex items-center justify-center gap-2",
                    actionLoading === 'cite' && "opacity-50 cursor-wait"
                  )}
                >
                  <Quote size={14} className={cn(actionLoading === 'cite' && "animate-pulse")} />
                  {actionLoading === 'cite' ? "GENERATING..." : "CITE_NODE"}
                </button>
                <button 
                  onClick={handleResolve}
                  disabled={resolving}
                  className="py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] font-bold hover:bg-orange-500/20 text-orange-400 transition-all flex items-center justify-center gap-2"
                >
                  <Globe size={14} className={resolving ? "animate-spin" : ""} />
                  {resolving ? "RESOLVING..." : "INSTITUTIONAL"}
                </button>
             </div>

             <div className="grid grid-cols-1 pt-4">
                <div className="relative group/export">
                  <button 
                    className="w-full py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] font-bold hover:bg-purple-500/20 text-purple-400 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} />
                    EXPORT_RESEARCH
                    <ChevronDown size={12} />
                  </button>
                  <div className="absolute bottom-full left-0 w-full mb-2 hidden group-hover/export:block bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                    <button onClick={() => handleExport("pdf")} className="w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-white/5 text-white/60 hover:text-white transition-colors">📄 PDF_BRIEF</button>
                    <button onClick={() => handleExport("word")} className="w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-white/5 text-white/60 hover:text-white transition-colors">📘 WORD_DOC</button>
                    <button onClick={() => handleExport("ppt")} className="w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-white/5 text-white/60 hover:text-white transition-colors">📙 PPT_SLIDES</button>
                  </div>
                </div>
             </div>

             <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/40 uppercase mb-3 font-bold tracking-tighter italic">Deep_Query_Assistant</p>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask paper anything..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-accent/40"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const target = e.currentTarget;
                        const q = target.value;
                        if (!q) return;
                        
                        setActionLoading('qa');
                        target.value = 'Asking Sovereign Engine...';
                        target.disabled = true;
                        
                        try {
                          const res = await axios.post('http://127.0.0.1:8000/api/agent/qa', { id, question: q });
                          alert(`Q: ${q}\n\n${res.data.answer || "No insights found."}`);
                        } catch (err) {
                           alert("Network failure during QA query.");
                        } finally {
                          target.disabled = false;
                          target.value = '';
                          target.focus();
                          setActionLoading(null);
                        }
                      }
                    }}
                  />
                </div>
             </div>
          </section>

          {/* Next Read Recommendations */}
          <section>
            <h2 className="text-[10px] font-black tracking-widest text-accent uppercase mb-4 flex items-center gap-2">
              <ArrowRight size={14} /> Recommended_Next_Read
            </h2>
            <div className="space-y-4">
              <button 
                onClick={async () => {
                  try {
                    const res = await axios.post('http://127.0.0.1:8000/api/agent/recommend', { id });
                    console.log("Recommendations:", res.data.recommendations);
                    alert("Highly relevant papers discovered. Check console for details.");
                  } catch (err) { console.error(err); }
                }}
                className="w-full p-4 bg-white/2 border border-white/5 rounded-2xl text-[11px] text-white/40 hover:border-accent/30 transition-all italic text-left"
              >
                Scan cognitive map for related lineages...
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black tracking-widest text-accent uppercase mb-3">Abstract</h2>
            <p className="text-sm leading-relaxed text-white/70 font-sans">{paper.abstract || paper.content}</p>
          </section>

          <section>
            <h2 className="text-[10px] font-black tracking-widest text-accent uppercase mb-3">Authors</h2>
            <div className="flex flex-wrap gap-2">
              {paper.metadata?.authors?.map((author: string) => (
                <span key={author} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60">
                  {author}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black tracking-widest text-accent uppercase mb-3">Lineage Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase mb-1">Citations</p>
                <p className="text-2xl font-bold font-mono">{paper.metadata?.citationCount || 0}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase mb-1">References</p>
                <p className="text-2xl font-bold font-mono">{paper.metadata?.referenceCount || 0}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Dynamic View Panel (PDF or Markdown) */}
        <div className="flex-1 bg-[#111] relative group overflow-y-auto no-scrollbar">
          {id.toString().startsWith("arxiv_") || /^\d{4}\.\d{4,5}$/.test(id.toString()) ? (
             <>
               <iframe 
                 src={`https://arxiv.org/pdf/${arxivId}.pdf`}
                 className="w-full h-full border-none"
                 title="PDF Reader"
               />
               <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => window.open(`https://arxiv.org/pdf/${arxivId}.pdf`, "_blank")}
                   className="p-3 bg-black/80 backdrop-blur border border-white/20 rounded-full text-white hover:text-accent shadow-2xl"
                 >
                   <ExternalLink size={20} />
                 </button>
               </div>
             </>
          ) : (
             <div className="p-10 max-w-3xl mx-auto">
               <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-2">
                 <FileText size={14} /> Cognitive_Note_View
               </div>
               {renderMarkdown(paper.content)}
             </div>
          )}
        </div>
      </div>
      <CitationModal 
        isOpen={citationModal.open} 
        onClose={() => setCitationModal(prev => ({ ...prev, open: false }))}
        citation={citationModal.text}
        style={citationModal.style}
      />
    </div>
  );
}
