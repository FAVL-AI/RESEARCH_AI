"use client";
import React, { useState } from 'react';
import { PenTool, ShieldAlert, Sparkles, RefreshCcw, CheckCircle, Fingerprint } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export const GhostwriterPanel = () => {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('Academic');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{ ai_probability: number, human_probability: number, flagged_sentences: string[] } | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setProcessing(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ghostwriter/scan', { text });
      setScanResult(res.data);
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setProcessing(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ghostwriter/humanize', { text, tone });
      setText(res.data.humanized_text);
      // Auto-scan after humanizing to show success
      const scanRes = await axios.post('http://127.0.0.1:8000/api/ghostwriter/scan', { text: res.data.humanized_text });
      setScanResult(scanRes.data);
    } catch (err) {
      console.error("Humanize failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#050505] p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 w-fit">
            <PenTool className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black tracking-widest text-accent uppercase">Ghostwriter Suite</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Anti-Detection Engine</h1>
          <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
            Scan texts for AI probabilities resembling Turnitin and Quillbot heuristics. Utilize the hyper-burstiness Humanizer engine to forcefully restructure paragraphs to mirror organic human cognition and evade all AI flags.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Editor */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-transparent rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200" />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste AI-generated manuscript or research here..."
                className="relative w-full h-[500px] bg-black border border-white/10 rounded-2xl p-6 text-white/80 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-accent/40 transition-colors"
                spellCheck={false}
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white/70 focus:outline-none focus:border-accent"
                >
                  <option value="Academic">Academic / Research</option>
                  <option value="Journalistic">Editorial / Journalistic</option>
                  <option value="Conversational">Natural / Conversational</option>
                  <option value="Technical">Technical Specifications</option>
                </select>
                
                <button 
                  onClick={handleScan}
                  disabled={processing || !text}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 transition-all disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Scan Plagiarism
                </button>
              </div>

              <button
                onClick={handleHumanize}
                disabled={processing || !text}
                className="relative group overflow-hidden px-8 py-2 rounded-xl bg-white text-black font-black text-sm tracking-tight flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-white opacity-0 group-hover:opacity-20 transition-opacity" />
                {processing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
                HUMANIZE
              </button>
            </div>
          </div>

          {/* Analysis Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-black border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 to-transparent" />
              <h3 className="text-xs font-black tracking-widest text-white/40 uppercase mb-6 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" /> Telemetry
              </h3>

              {scanResult ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold text-white">AI Detection Prob.</span>
                      <span className={cn("text-2xl font-black", scanResult.ai_probability > 50 ? "text-red-500" : "text-emerald-400")}>
                        {scanResult.ai_probability}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", scanResult.ai_probability > 50 ? "bg-red-500" : "bg-emerald-400")} 
                        style={{ width: `${scanResult.ai_probability}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold text-white">Human Organic Index</span>
                      <span className={cn("text-xl font-black", scanResult.human_probability > 80 ? "text-accent" : "text-white/40")}>
                        {scanResult.human_probability}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000" 
                        style={{ width: `${scanResult.human_probability}%` }}
                      />
                    </div>
                  </div>
                  
                  {scanResult.ai_probability < 20 && (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <p className="text-xs font-medium text-emerald-400/90">Text appears entirely human-generated and should bypass Turnitin and Quillbot.</p>
                    </div>
                  )}

                  {scanResult.flagged_sentences && scanResult.flagged_sentences.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                      <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">Flagged Vectors</span>
                      {scanResult.flagged_sentences.map((s, i) => (
                        <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <p className="text-[11px] leading-relaxed text-red-100/70">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                  <span className="text-xs font-bold text-white/20">Awaiting Plagiarism Scan...</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
