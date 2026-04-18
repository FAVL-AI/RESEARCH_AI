"use client";

import { 
  AudioLines, 
  Presentation, 
  Video, 
  Network, 
  FileText, 
  GraduationCap, 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  LayoutGrid
} from "lucide-react";
// --- SOVEREIGN_BUILD_RESONANCE_MARKER :: FB_2026_04 ---
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

interface StudioSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const StudioSidebar = ({ collapsed, setCollapsed }: StudioSidebarProps) => {
  const { addLog, addStudioArtifact, activeSources, setIsLoading } = useStore();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const studioItems = [
    { icon: AudioLines, label: "Audio Overview", id: "audio" },
    { icon: Presentation, label: "Slide Deck", id: "slides" },
    { icon: Video, label: "Video Preview", id: "video" },
    { icon: Network, label: "Mind Map", id: "map" },
    { icon: FileText, label: "Deep Report", id: "report" },
    { icon: GraduationCap, label: "Flashcards", id: "flashcards" },
    { icon: Brain, label: "SME Quiz", id: "quiz" },
    { icon: LayoutGrid, label: "Data Table", id: "table" },
  ];

  const handleGenerate = async (id: string, label: string) => {
    if (activeSources.length === 0) {
      addLog({
        message: "Studio blocked: No knowledge sources connected. Connect a source in the left panel first.",
        status: "warning",
        timestamp: new Date().toISOString()
      });
      return;
    }

    setGeneratingId(id);
    addLog({
      message: `RESEARCH_AI: Initiating high-fidelity ${label} generation...`,
      status: "info",
      timestamp: new Date().toISOString()
    });

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/studio/generate", {
        type: id,
        source_ids: activeSources.map(s => s.id)
      });

      addStudioArtifact({
        id: Math.random().toString(36).substr(2, 9),
        type: id,
        label,
        content: res.data.content,
        timestamp: new Date().toISOString()
      });

      addLog({
        message: `Studio SUCCESS: ${label} artifact synthesized successfully.`,
        status: "success",
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      addLog({
        message: `Studio Error: Failed to generate ${label}. ${err.message}`,
        status: "error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-full bg-[#050505] border-l border-white/5 flex flex-col relative z-40 transition-all duration-300"
    >
      <div className="p-6">
        <div className={cn("flex items-center gap-2 mb-8 transition-opacity", collapsed && "opacity-0")}>
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Studio Hub</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {studioItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => handleGenerate(item.id, item.label)}
              disabled={generatingId !== null}
              className={cn(
                "w-full flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-accent/40 hover:bg-white/[0.06] transition-all group relative overflow-hidden disabled:opacity-50",
                collapsed && "items-center p-4",
                generatingId === item.id && "border-accent/60 bg-accent/5 ring-1 ring-accent/20"
              )}
            >
              <div className="flex items-center gap-3">
                {generatingId === item.id ? (
                  <Sparkles className="w-5 h-5 text-accent animate-spin" />
                ) : (
                  <item.icon className="w-5 h-5 text-white/60 group-hover:text-accent transition-colors" />
                )}
                {!collapsed && <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{item.label}</span>}
              </div>
              
              {!collapsed && (
                <div className="flex items-center justify-between mt-1">
                  <span className={cn(
                    "text-[10px] uppercase font-black tracking-widest leading-none",
                    generatingId === item.id ? "text-accent animate-pulse" : "text-white/20"
                  )}>
                    {generatingId === item.id ? "Synthesizing..." : "Generate"}
                  </span>
                  <div className={cn(
                    "w-1 h-1 rounded-full transition-colors",
                    generatingId === item.id ? "bg-accent" : "bg-white/10 group-hover:bg-accent"
                  )} />
                </div>
              )}

              {/* Hover Glow Effect */}
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/20 transition-all" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6">
        <div className={cn("bg-accent/5 border border-accent/10 rounded-2xl p-6 text-center transition-opacity", collapsed && "opacity-0 invisible")}>
           <Sparkles className="w-6 h-6 text-accent mx-auto mb-3" />
           <p className="text-xs font-bold text-white/60 leading-tight">Studio output will be saved here.</p>
           <p className="text-[10px] text-white/20 mt-2">After adding sources, click to generate specialized research artifacts.</p>
        </div>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all shadow-xl z-50 text-white/60"
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </motion.div>
  );
};
