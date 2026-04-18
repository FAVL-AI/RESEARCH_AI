"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  Database, 
  Box, 
  Library, 
  Bot, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Search,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Graph Map", href: "/dashboard" },
    { icon: FileText, label: "Clippings", href: "/dashboard/clippings" },
    { icon: Database, label: "Raw Data", href: "/dashboard/raw" },
    { icon: Box, label: "Wiki Brain", href: "/dashboard/wiki" },
    { icon: Library, label: "Archive", href: "/dashboard/papers" },
    { icon: Bot, label: "Orchestrator", href: "/dashboard/agents" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 64 : 260 }}
      className="h-full border-r border-white/10 bg-[#050505] flex flex-col relative group z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
    >
      {/* Header / Brand */}
      <Link href="/dashboard" className={cn(
        "p-6 flex items-center gap-3 overflow-hidden cursor-pointer",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]">
          <Box className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <span className="font-bold tracking-tighter text-lg whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            RESEARCH<span className="text-accent underline decoration-accent/30 underline-offset-4">AI</span>
          </span>
        )}
      </Link>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Query memory..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-1.5 mt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group/item relative overflow-hidden",
                isActive 
                  ? "bg-accent/10 text-white border border-accent/20" 
                  : "text-white/40 hover:bg-white/5 hover:text-white/80 border border-transparent",
                collapsed && "justify-center px-0"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-accent" : "group-hover/item:text-accent/60"
              )} />
              {!collapsed && <span className="text-sm font-medium tracking-tight">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-white/5 bg-white/2">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-accent/10 border border-accent/30 flex items-center justify-center">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Root_Access</span>
              <span className="text-xs font-bold truncate text-white/80 tracking-tight">Frank_Van_Laarhoven</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all shadow-xl z-50 text-white/60"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>
  );
};
