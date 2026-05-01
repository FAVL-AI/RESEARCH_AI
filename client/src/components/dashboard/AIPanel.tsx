"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Mic, Paperclip, Minimize2, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import io from "socket.io-client";
import { useStore } from "@/store/useStore";

interface LogEntry {
  message: string;
  status: 'loading' | 'success' | 'error' | 'idle';
}

export const AIPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<any | null>(null);
  const { logs: globalLogs, addLog, clearLogs } = useStore();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "System initialized. I am your Memory Agent. How can I assist your research today?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io("http://127.0.0.1:8000");
    setSocket(newSocket);

    newSocket.on("agent:log", (log: LogEntry) => {
      addLog(log);
    });

    newSocket.on("agent:result", (result: any) => {
      setMessages(prev => [...prev, { role: "assistant", text: result.summary }]);
    });

    return () => { newSocket.close(); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, globalLogs]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    setMessages([...messages, { role: "user", text: input }]);
    clearLogs();
    addLog({ message: 'Initializing research swarm...', status: 'loading' });
    
    socket.emit('agent:query', { query: input, id: Date.now().toString() });
    
    setInput("");
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      aria-label="Open AI Panel"
      className="absolute bottom-8 right-8 w-14 h-14 bg-white dark:bg-[#0a0a0a]ccent text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
    >
      <Bot size={24} />
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? "64px" : "500px",
        width: isMinimized ? "240px" : "380px"
      }}
      className={cn(
        "absolute bottom-8 right-8 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-black/20 dark:border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-50 transition-all duration-300",
        isMinimized && "rounded-full"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white dark:bg-[#0a0a0a]ccent rounded-full animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase">System_Orchestrator</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} aria-label={isMinimized ? "Maximize AI Panel" : "Minimize AI Panel"} className="p-1 hover:bg-black/10 dark:bg-white/10 rounded">
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} aria-label="Close AI Panel" className="p-1 hover:bg-black/10 dark:bg-white/10 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Recent Activity Mini-Log */}
          <div className="px-4 py-2 bg-white dark:bg-[#0a0a0a]ccent/5 border-b border-black/5 dark:border-white/5">
            <div className="flex flex-col gap-1">
              {globalLogs.slice(0, 3).map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-accent/60 truncate opacity-80">{log.message}</span>
                  {log.status === 'loading' && <div className="w-1.5 h-1.5 bg-white dark:bg-[#0a0a0a]ccent rounded-full animate-pulse shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "max-w-[85%] p-3 rounded-xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-white dark:bg-[#0a0a0a]ccent/10 text-black dark:text-white ml-auto border border-accent/20" 
                  : "bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 mr-auto border border-black/5 dark:border-white/5 shadow-inner"
              )}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/5 dark:bg-white/5">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-accent/40 transition-colors">
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Task the System..."
                  className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none border-none placeholder:text-black/40 dark:text-white/20"
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex gap-2">
                    <button aria-label="Attach file" className="text-black/60 dark:text-white/40 hover:text-black dark:text-white transition-colors"><Paperclip size={16} /></button>
                    <button aria-label="Use microphone" className="text-black/60 dark:text-white/40 hover:text-accent transition-colors"><Mic size={16} /></button>
                  </div>
                  <button 
                    onClick={handleSend}
                    aria-label="Send message"
                    className="p-1.5 bg-white dark:bg-[#0a0a0a]ccent text-black rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
