"use client";

import { 
  FileText, 
  Database, 
  Box, 
  Library, 
  Bot, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const menuItems = [
    { icon: FileText, label: "Clippings", id: "clippings" },
    { icon: Database, label: "Raw", id: "raw" },
    { icon: Box, label: "Wiki", id: "wiki" },
    { icon: Library, label: "Papers", id: "papers" },
    { icon: Bot, label: "Agents", id: "agents" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 64 : 260 }}
      className="h-full border-r border-border bg-[#050505] flex flex-col relative group"
    >
      {/* Header / Brand */}
      <div className={cn(
        "p-6 flex items-center gap-3 overflow-hidden",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center shrink-0">
          <Box className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <span className="font-bold tracking-tighter text-lg whitespace-nowrap">
            RESEARCH<span className="text-accent">AI</span>
          </span>
        )}
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search concepts..."
              className="w-full bg-muted border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all group/item hover:bg-muted text-white/60 hover:text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0 group-hover/item:text-accent transition-colors" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate">SYSTEM_ADMIN</span>
              <span className="text-[10px] text-accent font-mono">STATUS: ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-border border border-muted flex items-center justify-center hover:bg-accent hover:border-accent hover:text-black transition-all"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>
  );
};
