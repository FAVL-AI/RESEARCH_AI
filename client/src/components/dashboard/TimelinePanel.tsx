"use client";

import React from "react";
import { History, Share2, Target } from "lucide-react";

export const TimelinePanel = () => {
    const events = [
        { time: "09:42", event: "Foundational Claim Detected: Linear scaling in transformer attention.", type: "discovery" },
        { time: "10:15", event: "Logical Contradiction: Efficiency vs. Long-range dependency gap identified.", type: "conflict" },
        { time: "11:04", event: "Novel Hypothesis Generated: Recursive Pruning with Memory Retention.", type: "hypothesis" },
        { time: "12:30", event: "Structural Validation: Claim aligns with IEEE SOTA metrics.", type: "validation" }
    ];

    return (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent relative z-30 pointer-events-auto">
            {events.map((e, i) => (
                <div key={i} className="p-4 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl group hover:border-accent/40 transition-all flex items-start gap-4">
                    <div className="mt-1">
                        {e.type === "discovery" && <Share2 size={14} className="text-accent" />}
                        {e.type === "conflict" && <Target size={14} className="text-red-400" />}
                        {e.type === "hypothesis" && <History size={14} className="text-orange-400" />}
                        {e.type === "validation" && <Share2 size={14} className="text-green-400" />}
                    </div>
                    <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-white/30 tracking-widest">{e.time}</span>
                            <span className={`text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                                e.type === "discovery" ? 'bg-accent/10 text-accent' : 
                                e.type === "conflict" ? 'bg-red-400/10 text-red-400' : 'bg-orange-400/10 text-orange-400'
                            }`}>
                                {e.type}
                            </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 font-medium">
                            {e.event}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
