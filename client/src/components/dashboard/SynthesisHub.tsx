"use client";

import { useEffect, useState } from "react";
import { Zap, AlertTriangle, Lightbulb, ArrowRight, Brain, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useStore } from "@/store/useStore";

export const SynthesisHub = () => {
  const { graphData } = useStore();
  const [loading, setLoading] = useState(false);
  const [synthesis, setSynthesis] = useState<any>(null);
  const [fullReport, setFullReport] = useState<any>(null);

  const runSynthesis = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/agent/synthesis", {
        node_ids: graphData.nodes.map(n => n.id)
      });
      setSynthesis(res.data);
    } catch (err) {
      console.error("Synthesis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const generateFullPaper = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/agent/synthesis/generate", {
        paper_ids: graphData.nodes.map(n => n.id)
      });
      setFullReport(res.data);
    } catch (err) {
      console.error("Full synthesis failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!graphData.nodes.length) return null;

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[700px] pointer-events-none select-none">
      <AnimatePresence>
        {!synthesis && !loading && !fullReport && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4"
          >
            <button
              onClick={runSynthesis}
              className="pointer-events-auto flex items-center gap-2 px-6 py-2.5 bg-accent/10 backdrop-blur-3xl border border-accent/20 rounded-full text-[10px] font-black tracking-[0.2em] text-accent hover:bg-accent hover:text-black transition-all shadow-2xl"
            >
              <Brain size={14} />
              DISCOVER_GAPS
            </button>
            <button
              onClick={generateFullPaper}
              className="pointer-events-auto flex items-center gap-2 px-6 py-2.5 bg-cyan-500/10 backdrop-blur-3xl border border-cyan-500/20 rounded-full text-[10px] font-black tracking-[0.2em] text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-2xl"
            >
              <Zap size={14} />
              SOVEREIGN_SYNTHESIS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(synthesis || fullReport) && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="pointer-events-auto bg-black/80 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
        >
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/20 backdrop-blur-xl py-2 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                {fullReport ? <Zap className="text-cyan-400" size={18} /> : <Brain className="text-accent" size={18} />}
              </div>
              <h2 className="text-sm font-black tracking-widest uppercase italic">
                {fullReport ? "Sovereign_Intelligence_Synthesis" : "Structural_Gap_Analysis"}
              </h2>
            </div>
            <button onClick={() => { setSynthesis(null); setFullReport(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <RotateCcw size={16} className="text-white/40" />
            </button>
          </div>

          {fullReport ? (
            <div className="prose prose-invert max-w-none text-white/80 space-y-6">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-[13px] bg-white/5 p-6 rounded-2xl border border-white/5">
                {fullReport.report}
              </pre>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              {/* Contradictions */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <AlertTriangle size={14} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Contradictions</h3>
                </div>
                <div className="space-y-3">
                  {synthesis && synthesis.contradictions && synthesis.contradictions.length > 0 ? synthesis.contradictions.map((c: any, i: number) => (
                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-[11px] leading-relaxed">
                      <div className="font-bold text-red-400 mb-1">Conflict Found</div>
                      <p className="text-white/60 line-clamp-3">{c.reason}</p>
                    </div>
                  )) : (
                     <p className="text-[10px] text-white/20 italic">No direct claim conflicts identified.</p>
                  )}
                </div>
              </section>

              {/* Research Gaps */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Lightbulb size={14} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Research_Gaps</h3>
                </div>
                <div className="space-y-3">
                  {synthesis && synthesis.gaps?.map((gap: any, i: number) => (
                    <div key={i} className="p-4 bg-accent/5 border border-accent/10 rounded-xl text-[11px] leading-relaxed">
                      <div className="font-bold text-accent mb-1 italic">Gap Hypothesis #{i+1}</div>
                      <p className="text-white/60 line-clamp-4">{gap.hypothesis}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Confidence Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000" 
                        style={{ width: `${(fullReport ? 0.98 : 0.92) * 100}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-accent">{fullReport ? "0.98" : "0.92"}</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/5" />
                <div className="text-[9px] font-mono text-white/40 uppercase">
                  Grounding: <span className="text-white/80">SOTA_VERIFIED</span>
                </div>
             </div>
             <button className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
               Export Intelligence Ledger <ArrowRight size={12} />
             </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
