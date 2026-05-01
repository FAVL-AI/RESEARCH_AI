"use client";

import { useStore } from "@/store/useStore";
import { X, Copy, Download, Share2, Sparkles, FileAudio, Presentation, GraduationCap, Brain, FileText, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ArtifactPreview = () => {
  const { studioArtifacts, clearStudioArtifacts } = useStore();
  const activeArtifact = studioArtifacts[0]; // Always show latest for now
  
  if (!activeArtifact) return null;

  const IconMap: any = {
    audio: AudioLines,
    slides: Presentation,
    flashcards: GraduationCap,
    quiz: Brain,
    report: FileText,
    table: LayoutGrid
  };

  const Icon = IconMap[activeArtifact.type] || Sparkles;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="w-full max-w-5xl h-[85vh] bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a]ccent/10 border border-accent/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{activeArtifact.label}</h2>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-white dark:bg-[#0a0a0a]ccent rounded-full animate-pulse" />
                   <p className="text-[10px] text-black/60 dark:text-white/40 uppercase font-black tracking-[0.2em]">RESEARCHAI_SYNTHESIS_NODE :: {activeArtifact.timestamp}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/10 dark:bg-white/10 transition-all">
                <Copy size={14} /> Copy
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#0a0a0a]ccent text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
                <Download size={14} /> Export
              </button>
              <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10 mx-2" />
              <button 
                onClick={clearStudioArtifacts}
                aria-label="Close preview"
                className="w-12 h-12 flex items-center justify-center bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/20 hover:text-black dark:text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-12 bg-[#080808]">
             <div className="max-w-3xl mx-auto">
                <pre className="text-black/80 dark:text-white/80 font-medium leading-relaxed whitespace-pre-wrap font-sans text-lg">
                  {typeof activeArtifact.content === 'object' 
                    ? JSON.stringify(activeArtifact.content, null, 2) 
                    : activeArtifact.content}
                </pre>
                
                {activeArtifact.type === 'audio' && (
                  <div className="mt-12 p-12 rounded-[2rem] bg-white dark:bg-[#0a0a0a]ccent/5 border border-accent/10 text-center">
                    <AudioLines className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">Neural Audio Component</h3>
                    <p className="text-sm text-black/60 dark:text-white/40">Ready for PhD-level voice synthesis via ElevenLabs / Local TTS.</p>
                  </div>
                )}
             </div>
          </div>

          {/* Footer Branding */}
          <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/40 text-center">
             <p className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em]">RESEARCHAI SOVEREIGN INTELLIGENCE PROTOCOL :: SECURE_SYNC_ACTIVE</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const AudioLines = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
  </svg>
);
