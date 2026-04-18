"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SourcesSidebar } from "@/components/dashboard/SourcesSidebar";
import { StudioSidebar } from "@/components/dashboard/StudioSidebar";
import { ArtifactPreview } from "@/components/dashboard/ArtifactPreview";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [studioCollapsed, setStudioCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans border-0">
      {/* 0. MINI NAV RAIL */}
      <Sidebar collapsed={navCollapsed} setCollapsed={setNavCollapsed} />

      {/* 1. SOURCES (Left) */}
      <SourcesSidebar 
        collapsed={sourcesCollapsed} 
        setCollapsed={setSourcesCollapsed} 
      />

      {/* 2. MAIN STAGE */}
      <main className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] border-x border-white/5">
        {children}
      </main>

      {/* 3. STUDIO (Right) */}
      <StudioSidebar 
        collapsed={studioCollapsed} 
        setCollapsed={setStudioCollapsed} 
      />
    </div>
  );
}
