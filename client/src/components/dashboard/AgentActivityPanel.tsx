"use client";

import { useStore } from "@/store/useStore";
import { Bot, Terminal, Activity, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const AgentActivityPanel = () => {
  const { logs } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="w-full flex-1 min-h-[250px] z-40 flex flex-col pointer-events-none mt-4">
      <div className="flex items-center gap-2 mb-3 ml-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 border border-accent/30 animate-pulse">
           <Activity size={12} className="text-accent" />
        </div>
        <span className="text-[10px] font-black tracking-widest text-accent uppercase drop-shadow-lg">Swarm_Activity</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pr-2 pointer-events-auto space-y-2 mask-linear-fade"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={i + (log.timestamp || '')}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-black/60 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl relative group overflow-hidden"
            >
              {/* Status Indicator */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                log.status === 'success' ? 'bg-green-500' : 
                log.status === 'error' ? 'bg-red-500' :
                log.status === 'loading' ? 'bg-accent animate-pulse' : 'bg-white/20'
              )} />
              
              <div className="flex flex-col gap-1 pl-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.status === 'success' ? <CheckCircle2 size={10} className="text-green-500" /> : 
                     log.status === 'error' ? <AlertCircle size={10} className="text-red-500" /> :
                     <Terminal size={10} className="text-white/40" />}
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                       {log.status || 'LOG'}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-white/20">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-white/80 leading-snug">
                  {log.message}
                </p>
              </div>
              
              {/* Micro-sparkle on new logs */}
              {i === 0 && (
                <div className="absolute inset-0 bg-accent/5 pointer-events-none animate-pulse" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="p-4 bg-white/2 border border-dashed border-white/10 rounded-xl text-center">
            <p className="text-[10px] text-white/20 uppercase font-black italic">Waiting for swarm initiation...</p>
          </div>
        )}
      </div>
    </div>
  );
};
