"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Zap, RefreshCw } from "lucide-react";
import axios from "axios";

export const GovernancePanel = () => {
    const [decisions, setDecisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDecisions = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/governance/decisions");
            setDecisions(res.data);
        } catch (err) {
            console.error("Failed to fetch governance decisions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecisions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black tracking-[4px] uppercase text-white/30">Autonomous Governance</h3>
                <button 
                    onClick={fetchDecisions}
                    disabled={loading}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-accent"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
            
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : decisions.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/20 uppercase font-black">No Active Decisions</p>
                    </div>
                ) : (
                    decisions.map((d, i) => (
                        <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-accent/30 transition-all cursor-crosshair">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-white/80 truncate w-2/3">{d.topic}</span>
                                <div className={`px-2 py-1 rounded-md text-[8px] font-black tracking-widest flex items-center gap-1.5 ${
                                    d.verdict === "CONTINUE" ? 'bg-accent/10 text-accent' : 
                                    d.verdict === "KILL" ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                                }`}>
                                    {d.verdict === "CONTINUE" ? <Zap size={8} /> : <ShieldAlert size={8} />}
                                    {d.verdict}
                                </div>
                            </div>
                            <p className="text-[9px] leading-relaxed text-white/40 mb-3 line-clamp-2 italic">
                                "{d.reason}"
                            </p>
                            <div className="flex items-center gap-2 pt-3 border-t border-white/[0.03]">
                                <span className="text-[8px] uppercase font-bold text-white/20">Next Vector:</span>
                                <span className="text-[8px] uppercase font-black text-accent/60 tracking-wider">{d.action}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
