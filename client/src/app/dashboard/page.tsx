"use client";

import { GraphCanvas } from "@/components/dashboard/GraphCanvas";
import { CytoscapeCanvas } from "@/components/dashboard/CytoscapeCanvas";
import { AIPanel } from "@/components/dashboard/AIPanel";
import { SynthesisHub } from "@/components/dashboard/SynthesisHub";
import { AgentActivityPanel } from "@/components/dashboard/AgentActivityPanel";
import { MissionControlPanel } from "@/components/dashboard/MissionControlPanel";
import { useSwarmState } from "@/hooks/useSwarmState";
import { useState } from "react";
import { Maximize2, Layers } from "lucide-react";

import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { TimelinePanel } from "@/components/dashboard/TimelinePanel";
import { SupervisorPanel } from "@/components/dashboard/SupervisorPanel";

export default function DashboardPage() {
  const [view, setView] = useState<'d3' | 'cy'>('cy');
  
  // Initialize Real-time Swarm Telemetry
  useSwarmState();

  return (
    <div className="flex flex-col h-full bg-[#030303] text-white selection:bg-accent/30 overflow-hidden">
      {/* Top Layer: Global Infrastructure Status */}
      <div className="h-14 border-b border-white/5 flex items-center px-8 bg-black/40 backdrop-blur-xl justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-black tracking-[4px] uppercase text-white/40">Research OS // Operational</span>
        </div>
        <div className="flex gap-8">
            <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Distributed Workers: <span className="text-accent">12 ACTIVE</span></div>
            <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Global Memory: <span className="text-accent">SYNCHRONIZED</span></div>
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Region 1: Mission Control (Sidebar) */}
        <div className="w-[420px] h-full p-8 border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar">
          <MissionControlPanel />
          <div className="mt-8 pt-8 border-t border-white/5">
            <GovernancePanel />
          </div>
        </div>

        {/* Region 2: Intelligence Canvas (Center Expansion) */}
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
             <div className="absolute inset-0 z-0 opacity-40">
               {view === 'd3' ? <GraphCanvas /> : <CytoscapeCanvas />}
             </div>
             
             {/* Region 3: Timeline & Hypothesis Discovery (Floating Bottom) */}
             <div className="absolute bottom-8 left-8 right-8 z-30">
                <TimelinePanel />
             </div>
          </div>
        </div>

        {/* Region 4: Agent Activity, Supervision & CTO Decisions (Right) */}
        <div className="w-[380px] h-full bg-black/40 border-l border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
            <SupervisorPanel />
            <AgentActivityPanel />
            <div className="min-h-[300px] bg-white/[0.02] rounded-3xl border border-white/5 p-6 backdrop-blur-3xl">
                <h3 className="text-[10px] font-black tracking-widest uppercase text-accent mb-4">Sovereign Synthesis</h3>
                <SynthesisHub />
            </div>
            {/* View Toggle */}
            <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setView('d3')}
                  className={`p-3 rounded-2xl border ${view === 'd3' ? 'bg-accent text-black border-accent' : 'bg-black/40 text-white/40 border-white/10'} backdrop-blur-xl transition-all shadow-2xl`}
                >
                  <Layers size={18} />
                </button>
                <button 
                  onClick={() => setView('cy')}
                  className={`p-3 rounded-2xl border ${view === 'cy' ? 'bg-accent text-black border-accent' : 'bg-black/40 text-white/40 border-white/10'} backdrop-blur-xl transition-all shadow-2xl`}
                >
                  <Maximize2 size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
