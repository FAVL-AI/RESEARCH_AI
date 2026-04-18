"use client";

import { Box, Search, Plus, BookOpen } from "lucide-react";
import Link from "next/link";

export default function WikiIndexPage() {
  const topConcepts = [
    { title: "Transformers", id: "transformer_architecture", preview: "The backbone of modern NLP and LLMs." },
    { title: "RAG", id: "retrieval_augmented_generation", preview: "Connecting LLMs to external knowledge sources." },
    { title: "Vector Embeddings", id: "vector_embeddings", preview: "Mathematical representation of semantic meaning." },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-2xl">
            <Box className="text-accent" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Wiki_Neural_Brain</h1>
            <p className="text-white/40 text-sm font-medium tracking-tight">Structured conceptual knowledge synthesized from research paper clusters.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-accent text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
          <Plus size={16} /> New_Entry
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Query the conceptual corpus..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-5 text-lg font-medium focus:outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topConcepts.map((concept) => (
          <Link 
            key={concept.id} 
            href={`/dashboard/wiki/${concept.id}`}
            className="p-8 border border-white/10 rounded-3xl bg-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all group"
          >
            <BookOpen className="text-white/20 group-hover:text-accent transition-colors mb-6" size={24} />
            <h3 className="text-xl font-bold tracking-tight mb-2 uppercase">{concept.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed font-medium">{concept.preview}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
