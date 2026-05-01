"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  citation: string;
  style: string;
}

export const CitationModal = ({ isOpen, onClose, citation, style }: CitationModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white dark:bg-[#0a0a0a]ccent/20 blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-black dark:text-white">Export Citation</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">{style} style</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full text-black/60 dark:text-white/40 hover:text-black dark:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative group">
              <div className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-6 font-serif text-sm leading-relaxed text-black/80 dark:text-white/80 select-all">
                {citation}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-black/5 dark:bg-white/5 hover:bg-white dark:bg-[#0a0a0a]ccent border border-black/10 dark:border-white/10 hover:border-accent rounded-lg text-black/60 dark:text-white/40 hover:text-black transition-all flex items-center gap-2 group-hover:opacity-100 opacity-60"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="text-[9px] font-black uppercase tracking-tighter">{copied ? "COPIED" : "COPY"}</span>
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-black dark:text-white transition-all underline decoration-accent/40 underline-offset-4"
              >
                DONE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
