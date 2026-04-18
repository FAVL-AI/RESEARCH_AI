"use client";

import { FileText, Scissors, Bookmark } from "lucide-react";

export default function ClippingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-accent/20 rounded-2xl">
          <FileText className="text-accent" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Clippings_Archive</h1>
          <p className="text-white/40 text-sm font-medium tracking-tight">Isolated segments, highlighted quotes, and saved claim matrices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 border border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-white/5 rounded-full"><Scissors className="text-white/20" size={24} /></div>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-loose">No_Snippets_Detected<br/>Start clipping from the paper reader.</p>
        </div>
        
        <div className="p-8 border border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-white/5 rounded-full"><Bookmark className="text-white/20" size={24} /></div>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-loose">Saved_Hypotheses<br/>Insights from Synthesis Hub will appear here.</p>
        </div>
      </div>
    </div>
  );
}
