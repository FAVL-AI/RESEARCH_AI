"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { GraphCanvas } from "@/components/dashboard/GraphCanvas";
import { AIPanel } from "@/components/dashboard/AIPanel";

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      {/* Main Content (Graph) */}
      <main className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]">
        <GraphCanvas />
        <AIPanel />
      </main>
    </div>
  );
}
