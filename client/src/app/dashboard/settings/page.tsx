"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Globe, Cpu, Sliders, Save, Link as LinkIcon } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const [proxyUrl, setProxyUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current settings
    axios.get("http://127.0.0.1:8000/api/settings/proxy")
      .then(res => setProxyUrl(res.data.proxy_url))
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  const handleSaveProxy = async () => {
    setSaving(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/settings/proxy", { proxy_url: proxyUrl });
      alert("Institutional settings synchronized with backend.");
    } catch (err) {
      console.error("Failed to save proxy:", err);
    } finally {
      setSaving(false);
    }
  };

  const settingsGroups = [
    { title: "Cognitive Engine", icon: Cpu, options: ["Model: GPT-4o", "Temperature: 0.7", "Max Tokens: 4096"] },
    { title: "Security", icon: Shield, options: ["Git Persistence: ENABLED", "Local DB: LanceDB", "Encryption: AES-256"] },
  ];

  return (
    <div className="p-10 h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#050505]">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Settings className="text-accent" size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">System_Configuration</h1>
        </div>
        <p className="text-black/60 dark:text-white/40 text-sm max-w-2xl">
          Calibrate the autonomous research layer, institutional gateways, and cognitive constraints.
        </p>
      </header>

      <div className="max-w-4xl space-y-8">
        {/* Institutional Settings */}
        <div className="p-8 bg-accent/5 border border-accent/20 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <LinkIcon size={120} className="text-accent" />
           </div>
           <div className="flex items-center gap-3 mb-6">
              <Globe className="text-accent" size={20} />
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">Institutional_Access</h2>
           </div>
           
           <div className="space-y-4 relative z-10">
              <p className="text-xs text-black/70 dark:text-white/60 max-w-xl mb-4">
                Configure your University/Institution Library Proxy to resolve gated research papers and DOI links autonomously.
              </p>
              <div className="flex gap-3">
                 <input 
                  type="text" 
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  placeholder="https://proxy.lib.youruni.edu/login?url="
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:border-accent/40 outline-none transition-all font-mono"
                 />
                 <button 
                  onClick={handleSaveProxy}
                  disabled={saving}
                  className="px-6 bg-accent text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                 >
                   {saving ? "SYNCING..." : "SAVE_PROXY"}
                   <Save size={14} />
                 </button>
              </div>
              <p className="text-[9px] text-black/40 dark:text-white/20 uppercase tracking-widest">Example: https://proxy.lib.university.edu/login?url=</p>
           </div>
        </div>

        {/* Existing Groups */}
        {settingsGroups.map((group, i) => (
          <div key={i} className="p-8 bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <group.icon className="text-black/40 dark:text-white/40" size={20} />
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">{group.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {group.options.map((opt, j) => (
                 <div key={j} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm">
                   <span className="text-black/70 dark:text-white/60">{opt}</span>
                   <Sliders size={14} className="text-accent/20" />
                 </div>
               ))}
            </div>
          </div>
        ))}
        
        <div className="pt-4">
          <button className="w-full py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 font-black uppercase tracking-widest rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all">
            Commit Global Infrastructure State
          </button>
        </div>
      </div>
    </div>
  );
}
