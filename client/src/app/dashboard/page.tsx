"use client";

import { GraphCanvas } from "@/components/dashboard/GraphCanvas";
import { CytoscapeCanvas } from "@/components/dashboard/CytoscapeCanvas";
import { AIPanel } from "@/components/dashboard/AIPanel";
import { SynthesisHub } from "@/components/dashboard/SynthesisHub";
import { AgentActivityPanel } from "@/components/dashboard/AgentActivityPanel";
import { MissionControlPanel } from "@/components/dashboard/MissionControlPanel";
import { useSwarmState } from "@/hooks/useSwarmState";
import { useState } from "react";
import { Maximize2, Layers, PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { TimelinePanel } from "@/components/dashboard/TimelinePanel";
import { SupervisorPanel } from "@/components/dashboard/SupervisorPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const [view, setView] = useState<'d3' | 'cy'>('cy');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  // Initialize Real-time Swarm Telemetry
  useSwarmState();

  return (
    <div className="flex flex-col h-full bg-background text-foreground selection:bg-accent/30 overflow-hidden transition-colors duration-300">
      {/* Top Layer: Global Infrastructure Status */}
      <div className="h-14 border-b border-black/5 dark:border-white/5 flex items-center px-8 bg-black/5 dark:bg-black/40 backdrop-blur-xl justify-between transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-black tracking-[4px] uppercase text-black/40 dark:text-white/40">Research OS // Operational</span>
        </div>
        <div className="flex items-center gap-8">
            <div className="text-[10px] uppercase font-bold text-black/40 dark:text-white/20 tracking-widest">Distributed Workers: <span className="text-accent">12 ACTIVE</span></div>
            <div className="text-[10px] uppercase font-bold text-black/40 dark:text-white/20 tracking-widest">Global Memory: <span className="text-accent">SYNCHRONIZED</span></div>
            <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Region 1: Mission Control (Sidebar) */}
        {isLeftPanelOpen && (
          <div className="w-[320px] shrink-0 h-full p-8 border-r border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/20 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent transition-colors duration-300">
            <MissionControlPanel />
            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
              <GovernancePanel />
            </div>
            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
              <h3 className="text-[10px] font-black tracking-widest uppercase text-accent mb-4">Discovery Timeline</h3>
              <TimelinePanel />
            </div>
          </div>
        )}

        {/* Region 2: Intelligence Canvas (Center Expansion) */}
        <div className="flex-1 relative flex flex-col min-w-0">
          <div className="flex-1 relative">
             <div className="absolute inset-0 z-0">
               {view === 'd3' ? <GraphCanvas /> : <CytoscapeCanvas />}
             </div>
          </div>
          
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            aria-label={isLeftPanelOpen ? "Close left panel" : "Open left panel"}
            className="absolute top-4 left-4 z-50 p-2 bg-white/80 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl text-black/50 dark:text-white/50 hover:text-accent hover:border-accent/50 transition-all backdrop-blur-xl shadow-2xl"
          >
            {isLeftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            aria-label={isRightPanelOpen ? "Close right panel" : "Open right panel"}
            className="absolute top-4 right-4 z-50 p-2 bg-white/80 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl text-black/50 dark:text-white/50 hover:text-accent hover:border-accent/50 transition-all backdrop-blur-xl shadow-2xl"
          >
            {isRightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>

        {/* Region 4: Agent Activity, Supervision & CTO Decisions (Right) */}
        {isRightPanelOpen && (
          <div className="w-[320px] shrink-0 h-full bg-black/5 dark:bg-black/40 border-l border-black/5 dark:border-white/5 p-6 flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent transition-colors duration-300">
              <SupervisorPanel />
              <AgentActivityPanel />
              <div className="min-h-[300px] bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5 p-6 backdrop-blur-3xl transition-colors duration-300">
                <h3 className="text-[10px] font-black tracking-widest uppercase text-accent mb-4">Sovereign Synthesis</h3>
                <SynthesisHub />
            </div>
            {/* View Toggle */}
            <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setView('d3')}
                  aria-label="Switch to D3 view"
                  className={`p-3 rounded-2xl border ${view === 'd3' ? 'bg-accent text-black border-accent' : 'bg-white/40 dark:bg-black/40 text-black/40 dark:text-white/40 border-black/10 dark:border-white/10'} backdrop-blur-xl transition-all shadow-2xl`}
                >
                  <Layers size={18} />
                </button>
                <button 
                  onClick={() => setView('cy')}
                  aria-label="Switch to Cytoscape view"
                  className={`p-3 rounded-2xl border ${view === 'cy' ? 'bg-accent text-black border-accent' : 'bg-white/40 dark:bg-black/40 text-black/40 dark:text-white/40 border-black/10 dark:border-white/10'} backdrop-blur-xl transition-all shadow-2xl`}
                >
                  <Maximize2 size={18} />
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
