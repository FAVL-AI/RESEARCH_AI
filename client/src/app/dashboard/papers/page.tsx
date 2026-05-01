"use client";

import { useEffect, useState } from "react";
import { Library, Search, Filter, ExternalLink, Calendar, User } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PapersArchive() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/nodes");
        const paperIds = res.data.nodes.filter((id: string) => id.startsWith("arxiv"));
        
        // Fetch details for each (in a real app, this would be a bulk endpoint)
        const details = await Promise.all(paperIds.map(async (id: string) => {
          try {
            const paperRes = await axios.get(`http://127.0.0.1:8000/api/nodes/${id}`);
            return paperRes.data;
          } catch {
            return { id, title: id.replace(/_/g, " ") };
          }
        }));
        
        setPapers(details);
      } catch (err) {
        console.error("Failed to fetch papers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  return (
    <div className="p-10 h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#050505]">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Library className="text-accent" size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">Research_Archive</h1>
        </div>
        <p className="text-black/60 dark:text-white/40 max-w-xl">
          Complete index of ingested research papers, citation networks, and distilled concepts.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Ingested", value: papers.length },
          { label: "Neural Links", value: "0" },
          { label: "Wiki Nodes", value: "0" },
          { label: "Crawled Sources", value: "1" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 rounded-2xl">
            <div className="text-[10px] font-black tracking-[0.2em] text-black/40 dark:text-white/20 uppercase mb-2">{stat.label}</div>
            <div className="text-2xl font-black font-mono text-black dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Link 
              key={paper.id}
              href={`/dashboard/paper/${paper.id}`}
              className="group p-6 bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 rounded-2xl hover:bg-black/10 hover:border-accent/30 dark:hover:bg-white/5 dark:hover:border-accent/30 transition-all block relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} className="text-accent" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-[9px] font-black font-mono text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded">PDF</div>
                <div className="text-[9px] font-black font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">{paper.id}</div>
              </div>
              <h3 className="font-bold text-lg mb-4 line-clamp-2 leading-tight text-black dark:text-white group-hover:text-accent transition-colors">{paper.title}</h3>
              
              <div className="flex items-center gap-4 text-black/60 dark:text-white/40">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <User size={12} />
                  <span className="truncate max-w-[100px]">{paper.metadata?.authors?.[0] || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Calendar size={12} />
                  <span>2024</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
