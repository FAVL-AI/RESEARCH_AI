"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side to avoid hydration mismatch
  }

  return (
    <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-full border border-black/10 dark:border-white/10">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-all ${
          theme === "light" 
            ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm" 
            : "text-zinc-500 hover:text-black dark:hover:text-white"
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-all ${
          theme === "system" 
            ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm" 
            : "text-zinc-500 hover:text-black dark:hover:text-white"
        }`}
        title="System Preference"
      >
        <Monitor className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-all ${
          theme === "dark" 
            ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm" 
            : "text-zinc-500 hover:text-black dark:hover:text-white"
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
