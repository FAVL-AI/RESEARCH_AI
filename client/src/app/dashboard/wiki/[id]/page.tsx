"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Share2, BookOpen, Loader2 } from "lucide-react";
import axios from "axios";

const renderMarkdown = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-white mt-6 mb-4 leading-tight tracking-tight">{line.replace('# ', '')}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-5 mb-3">{line.replace('## ', '')}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-md font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc mb-1 text-white/70">{line.replace('- ', '')}</li>;
    if (line.trim() === '') return <div key={i} className="h-4" />;
    return <p key={i} className="mb-2 text-white/70 leading-relaxed font-sans">{line}</p>;
  });
};

export default function WikiPage() {
  const { id } = useParams();
  const router = useRouter();
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNode = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/nodes/${id}`);
        setNode(res.data);
      } catch (err) {
        console.error("Failed to load node:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNode();
  }, [id]);

  return (
    <div className="p-10 h-full overflow-y-auto no-scrollbar bg-[#050505]">
       <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button aria-label="Go back" onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-accent/20 rounded-lg"><BookOpen className="text-accent" size={24} /></div>
             <h1 className="text-3xl font-black tracking-tight">{node?.title || id?.toString().replace(/_/g, " ")}</h1>
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
          <div className="text-white/60 leading-relaxed font-sans">
             {loading ? (
                <div className="flex flex-col items-center justify-center p-20 opacity-50 space-y-4">
                   <Loader2 size={32} className="animate-spin text-accent" />
                   <p className="tracking-widest uppercase text-[10px] font-bold">Accessing Memory Sector...</p>
                </div>
             ) : node ? (
                renderMarkdown(node.content)
             ) : (
                <div className="space-y-6">
                   <p className="text-lg text-white font-medium">Automatic distillation of {id} starting...</p>
                   <p>This is a placeholder for the Memory Agent's summarized knowledge. In a full implementation, this would render Markdown stored in the /nodes directory.</p>
                   <div className="h-px w-full bg-white/5" />
                   <p className="italic">Agent Status: Awaiting further ingestion for recursive summarization.</p>
                </div>
             )}
          </div>
        </div>
      </article>
    </div>
  );
}
