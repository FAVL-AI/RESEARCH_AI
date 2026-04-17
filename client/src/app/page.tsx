"use client";

import { MatrixRain } from "@/components/ui/MatrixRain";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = () => {
    setIsInitializing(true);
    // Simulate system initialization
    setTimeout(() => {
      // In a real app, we would handle logic here
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
      <MatrixRain />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-white">
          RESEARCH<span className="text-accent">AI</span>
        </h1>
        <p className="text-accent/60 font-mono text-sm uppercase tracking-widest mb-12">
          Local-First Knowledge Orchestrator v1.0.0
        </p>

        <button 
          onClick={handleInitialize}
          disabled={isInitializing}
          className="matrix-button"
        >
          {isInitializing ? (
            <span className="flex items-center gap-2">
              <motion.span 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 bg-accent rounded-full"
              />
              INITIALIZING...
            </span>
          ) : (
            "INITIALIZE SYSTEM"
          )}
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-8 left-8 text-white/20 font-mono text-[10px] leading-relaxed select-none"
      >
        <div>CORE_SYSTEM_TYPE: GRAPH_NATIVE_RAG</div>
        <div>MEMORY_PERSISTENCE: GIT_BACKED</div>
        <div>EMBEDDING_ENGINE: GEMMA_4_LOCAL</div>
        <div>STATUS: STANDBY</div>
      </motion.div>
    </main>
  );
}
