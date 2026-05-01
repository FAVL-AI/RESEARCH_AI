"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Crosshair, RefreshCw, XCircle } from "lucide-react";
import axios from "axios";

export const SupervisorPanel = () => {
    const [pending, setPending] = useState(false);
    const [missionId, setMissionId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");

    // Simulated mission ID - in real app would come from active mission state
    useEffect(() => {
        const checkPending = async () => {
             // Mock check - in real app would poll /api/mission/active/pending
             setPending(true); 
             setMissionId("msn_1776400000");
        };
        checkPending();
    }, []);

    const handleDecision = async (decision: 'approve' | 'reject' | 'revise') => {
        if (!missionId) return;
        
        try {
            await axios.post(`http://127.0.0.1:8000/api/mission/${missionId}/supervise`, {
                decision,
                notes
            });
            setPending(false);
            setNotes("");
        } catch (err) {
            console.error("Supervision failed:", err);
        }
    };

    if (!pending) return (
        <div className="p-6 bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl opacity-40">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-black/60 dark:text-white/40 mb-4">Supervisor Protocol</h3>
            <p className="text-[9px] text-black/40 dark:text-white/20 uppercase tracking-widest text-center py-8">No Pending Decisions</p>
        </div>
    );

    return (
        <div className="p-6 bg-white/[0.02] border border-accent/20 rounded-3xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0a0a0a]ccent animate-pulse" />
                    <h3 className="text-[10px] font-black tracking-widest uppercase text-accent">Pending Supervisor Action</h3>
                </div>
                <span className="text-[8px] font-bold text-black/40 dark:text-white/20 uppercase">ID: {missionId}</span>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-black/5 dark:bg-black/40 rounded-2xl border border-black/5 dark:border-white/5">
                    <p className="text-[11px] text-white/70 leading-relaxed italic">
                        "Draft Proposal: Autonomous pruning of large language models via recursive attention compression. Initial Novelty Score: 0.82"
                    </p>
                </div>

                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide direction or feedback notes..."
                    className="w-full h-24 bg-white/80 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-[10px] text-black/80 dark:text-white/80 placeholder:text-black/40 dark:text-white/20 focus:outline-none focus:border-accent/40 transition-all resize-none"
                />

                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => handleDecision('approve')}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0a0a0a]ccent/10 border border-accent/20 hover:bg-white dark:bg-[#0a0a0a]ccent/20 transition-all group"
                    >
                        <ShieldCheck size={16} className="text-accent mb-2" />
                        <span className="text-[8px] font-black uppercase text-accent/80 tracking-widest">Approve</span>
                    </button>
                    
                    <button 
                         onClick={() => handleDecision('revise')}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all group"
                    >
                        <RefreshCw size={16} className="text-orange-400 mb-2" />
                        <span className="text-[8px] font-black uppercase text-orange-400/80 tracking-widest">Revise</span>
                    </button>

                    <button 
                         onClick={() => handleDecision('reject')}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
                    >
                        <XCircle size={16} className="text-red-400 mb-2" />
                        <span className="text-[8px] font-black uppercase text-red-500/80 tracking-widest">Reject</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
