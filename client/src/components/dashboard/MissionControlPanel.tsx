"use client";

import { useState, useEffect } from "react";
import { Play, Square, Clock, Target, List, CheckCircle, FileText } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalTemplateModal } from "./UniversalTemplateModal";

export const MissionControlPanel = () => {
  const [mission, setMission] = useState<any>(null);
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/mission/status");
      if (res.data && res.data.status !== "idle") {
        setMission(res.data);
      } else {
        setMission(null);
      }
    } catch (err) {
      console.error("Failed to fetch mission status");
    }
  };

  const startMission = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/mission/start", {
        goal,
        duration_hours: duration,
        constraints: ["recent academic papers", "cross-paper claim validation"]
      });
      fetchStatus();
    } catch (err) {
      console.error("Failed to start mission");
    }
    setIsLoading(false);
  };

  const stopMission = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/mission/stop");
      setMission(null);
    } catch (err) {
      console.error("Failed to stop mission");
    }
  };

  return (
    <div className="p-6 bg-black/5 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Mission Control
        </h2>
        {mission && (
          <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">
              Autonomous
            </span>
          </div>
        )}
      </div>

      {!mission ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="objective-input" className="text-[10px] uppercase font-black tracking-widest text-black/60 dark:text-white/40 block">Research Objective</label>
              <button 
                onClick={() => setIsTemplateOpen(true)}
                className="text-[10px] uppercase font-black tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3" /> Use Universal Template
              </button>
            </div>
            <textarea
              id="objective-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Map the evolution of transformer architecture..."
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-black dark:text-white text-sm focus:border-cyan-500/50 outline-none h-32 resize-none transition-all"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="duration-input" className="text-[10px] uppercase font-black tracking-widest text-black/60 dark:text-white/40 mb-2 block">Duration (Hours)</label>
              <input 
                id="duration-input"
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-3 text-black dark:text-white outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <button
            onClick={startMission}
            disabled={isLoading || !goal}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" />
            Launch Sovereign Mission
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          {/* Mission Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/60">
              <span>Goal Alignment</span>
              <span>{Math.round(mission.progress)}%</span>
            </div>
            <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] uppercase font-black text-black/60 dark:text-white/40 tracking-widest">Elapsed</span>
              </div>
              <div className="text-xl font-mono text-black dark:text-white">
                {Math.floor((Date.now() / 1000 - mission.start_time) / 3600)}h
              </div>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <List className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] uppercase font-black text-black/60 dark:text-white/40 tracking-widest">Insights</span>
              </div>
              <div className="text-xl font-mono text-black dark:text-white">
                {mission.current_knowledge_size}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
            <label className="text-[10px] uppercase font-black tracking-widest text-black/60 dark:text-white/40 sticky top-0 bg-black/5 py-1">Recent Checkpoints</label>
            {mission.checkpoints.slice().reverse().map((cp: any, i: number) => (
              <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-4 duration-500">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="text-[11px] text-black/80 dark:text-white/80 leading-relaxed font-medium">{cp.summary}</div>
                  <div className="text-[9px] text-black/60 dark:text-white/40 font-mono italic">{new Date(cp.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={stopMission}
            className="w-full py-4 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-500 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all mt-auto"
          >
            <Square className="w-4 h-4 fill-current" />
            Terminate Mission
          </button>
        </div>
      )}

      <UniversalTemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onApply={(compiledGoal) => {
          setGoal(compiledGoal);
          setIsTemplateOpen(false);
        }}
      />
    </div>
  );
};
