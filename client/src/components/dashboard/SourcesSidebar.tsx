"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Globe, 
  Code, 
  Database, 
  HardDrive, 
  Cloud,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Brain,
  GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { useStore } from "@/store/useStore";
import { ConnectSourceModal } from "./ConnectSourceModal";

interface SourcesSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SourcesSidebar = ({ collapsed, setCollapsed }: SourcesSidebarProps) => {
  const { researchMode, setResearchMode, activeSources } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("web");

  const sourcesList = [
    { icon: Globe, label: "Web Search", id: "web" },
    { icon: Code, label: "GitHub", id: "github" },
    { icon: GitBranch, label: "GitLab", id: "gitlab" },
    { icon: Code, label: "GitBucket", id: "gitbucket" },
    { icon: Database, label: "Notion", id: "notion" },
    { icon: HardDrive, label: "Local Files", id: "local" },
    { icon: Cloud, label: "Cloud Drive", id: "cloud" },
  ];

  const handleSourceClick = (id: string) => {
    setSelectedType(id);
    setModalOpen(true);
  };

  return (
    <>
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 320 }}
      className="h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col relative z-40 transition-all duration-300"
    >
      <div className="p-6">
        <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 transition-opacity", collapsed && "opacity-0")}>
          Knowledge Sources
        </h2>

        <button 
          onClick={() => handleSourceClick("web")}
          className={cn(
            "w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-full py-4 text-sm font-bold hover:bg-white/10 transition-all shadow-inner px-6",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus className="w-5 h-5 text-accent" />
          {!collapsed && <span>Add sources</span>}
        </button>

        {!collapsed && (
          <div className="mt-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search concepts..."
              className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/40 transition-all placeholder:text-white/20"
            />
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
        {!collapsed && (
          <div className="grid grid-cols-2 gap-2 mb-8 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setResearchMode("fast")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                researchMode === "fast" ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"
              )}
            >
              <Sparkles className="w-3 h-3" /> Fast
            </button>
            <button 
              onClick={() => setResearchMode("deep")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                researchMode === "deep" ? "bg-accent/20 text-accent border border-accent/20" : "text-white/20 hover:text-white/40"
              )}
            >
              <Brain className="w-3 h-3" /> Deep
            </button>
          </div>
        )}

        <div className="space-y-1">
          {sourcesList.map((source) => (
            <button 
              key={source.id}
              onClick={() => handleSourceClick(source.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group hover:bg-white/5",
                collapsed && "justify-center"
              )}
            >
              <source.icon className="w-5 h-5 text-white/40 group-hover:text-accent transition-colors" />
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-white/80">{source.label}</span>
                  <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">
                    {activeSources.some(s => s.type === source.id) ? "Connected" : "Connect"}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 mt-auto">
        <div className={cn("text-center py-12 px-8 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]", collapsed && "hidden")}>
          {activeSources.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Active Ingestors</p>
              {activeSources.slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center gap-2 text-xs text-white/60">
                   <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                   {s.name || s.path}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-sm font-bold text-white/40 mb-2 leading-tight">Saved sources will appear here</p>
              <p className="text-[10px] text-white/20 leading-relaxed">Click Add source above to add PDFs, websites, GitHub repos or local files.</p>
            </>
          )}
        </div>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all shadow-xl z-50 text-white/60"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>

    <ConnectSourceModal 
      isOpen={modalOpen} 
      onClose={() => setModalOpen(false)} 
      type={selectedType} 
    />
    </>
  );
};
