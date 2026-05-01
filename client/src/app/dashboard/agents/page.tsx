"use client";

import { useEffect, useState } from "react";
import { Bot, Terminal, Activity, Zap, Shield, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentsPage() {
  const [activeAgents, setActiveAgents] = useState([
    { name: "ResearcherAgent", status: "IDLE", load: "0%", task: "Monitoring ArXiv" },
    { name: "ConnectorAgent", status: "ACTIVE", load: "12%", task: "Syncing Knowledge Graph" },
    { name: "MemoryAgent", status: "IDLE", load: "2%", task: "Indexing nodes" },
    { name: "CodeAgent", status: "STANDBY", load: "0%", task: "GitHub Crawler Offline" },
  ]);

  return (
    <div className="p-10 h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#050505]">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Bot className="text-accent" size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">System_Orchestrator</h1>
        </div>
        <p className="text-black/60 dark:text-white/40 max-w-xl">
          Real-time status of autonomous agents, ingestion pipelines, and semantic processing clusters.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {activeAgents.map((agent, i) => (
          <div key={i} className="p-6 bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <div className={`w-2 h-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-accent animate-pulse' : 'bg-black/20 dark:bg-white/20'}`} />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <Cpu size={24} className="text-black/60 dark:text-white/60" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-black dark:text-white">{agent.name}</h3>
                <p className="text-[10px] font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">{agent.status} | LOAD: {agent.load}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] text-black/40 dark:text-white/20 uppercase tracking-widest font-black">Current_Task</div>
              <div className="p-3 bg-white dark:bg-black/40 rounded-lg border border-black/10 dark:border-white/5 text-xs font-mono text-black/60 dark:text-white/60">
                {agent.task}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Terminal size={18} className="text-accent" />
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">Global_Event_Stream</h2>
        </div>
        <div className="bg-black/5 dark:bg-black/80 border border-black/10 dark:border-white/5 rounded-xl p-6 font-mono text-[11px] space-y-2 text-black/60 dark:text-white/40 max-h-60 overflow-y-auto no-scrollbar">
          <p><span className="text-accent">[SYS]</span> Orchestrator initialized on port 8000</p>
          <p><span className="text-accent">[AGENT]</span> ResearcherAgent connected to ArXiv pool</p>
          <p><span className="text-accent">[AGENT]</span> ConnectorAgent identified 12 semantic links</p>
          <p><span className="text-black/40 dark:text-white/20">[IDLE]</span> Awaiting user query...</p>
        </div>
      </section>
    </div>
  );
}
