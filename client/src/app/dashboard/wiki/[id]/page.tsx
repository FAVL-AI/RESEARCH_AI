"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Share2, BookOpen } from "lucide-react";

export default function WikiPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="p-10 h-full overflow-y-auto no-scrollbar bg-[#050505]">
       <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-accent/20 rounded-lg"><BookOpen className="text-accent" size={24} /></div>
             <h1 className="text-3xl font-black tracking-tight">{id?.toString().replace(/_/g, " ")}</h1>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-accent hover:text-black transition-all">
          <Edit3 size={16} />
          EDIT NOTE
        </button>
      </header>

      <article className="max-w-3xl mx-auto py-10">
        <div className="p-8 bg-white/2 border border-white/5 rounded-3xl min-h-[500px]">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent mb-6">Cognitive_Distillation</div>
          <div className="space-y-6 text-white/60 leading-relaxed font-sans">
             <p className="text-lg text-white font-medium">Automatic distillation of {id} starting...</p>
             <p>This is a placeholder for the Memory Agent's summarized knowledge. In a full implementation, this would render Markdown stored in the /nodes directory.</p>
             <div className="h-px w-full bg-white/5" />
             <p className="italic">Agent Status: Awaiting further ingestion for recursive summarization.</p>
          </div>
        </div>
      </article>
    </div>
  );
}
