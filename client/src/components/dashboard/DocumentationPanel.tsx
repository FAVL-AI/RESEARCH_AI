"use client";

import React, { useState } from 'react';
import { BookOpen, Network, Bot, Map, PenTool, ChevronRight, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CHAPTERS = [
  { id: 'core', icon: Network, title: 'Visual Graph Mapping', desc: 'Navigating the organic neural canvas.' },
  { id: 'swarm', icon: Bot, title: 'Agent Orchestrator', desc: 'Understanding the backend AI swarm.' },
  { id: 'recon', icon: Map, title: 'Literature Recon Suite', desc: 'Ingesting knowledge from S2/ArXiv.' },
  { id: 'evade', icon: PenTool, title: 'Ghostwriter Evasion', desc: 'Bypassing Turnitin algorithmic checks.' },
];

export const DocumentationPanel = () => {
  const [activeChapter, setActiveChapter] = useState('core');

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#050505] text-white overflow-hidden">
      
      {/* Documentation Inner Sidebar */}
      <div className="w-full md:w-80 h-full border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-3xl shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <BookOpen className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black tracking-widest text-accent uppercase">Platform Manual</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter">Documentation</h1>
          <p className="text-white/40 text-xs mt-2 leading-relaxed">The authoritative guide on integrating SOTA research tools into your cognitive workflow.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {CHAPTERS.map((chapter) => {
            const isActive = activeChapter === chapter.id;
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapter(chapter.id)}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all group",
                  isActive ? "bg-white/10 border border-white/20" : "hover:bg-white/5 border border-transparent"
                )}
              >
                <div className={cn(
                  "mt-0.5 p-2 rounded-lg transition-colors",
                  isActive ? "bg-accent/20 text-accent" : "bg-white/5 text-white/40 group-hover:text-white/80"
                )}>
                  <chapter.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className={cn("text-sm font-bold", isActive ? "text-white" : "text-white/70")}>{chapter.title}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{chapter.desc}</p>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 self-center transition-all",
                  isActive ? "text-accent translate-x-1 opacity-100" : "text-white/20 opacity-0 group-hover:opacity-100"
                )} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 h-full overflow-y-auto scroll-smooth relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto p-8 md:p-16 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 pb-32 marker:text-accent prose prose-invert prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-white/10 max-w-none"
            >
              {activeChapter === 'core' && <CoreChapter />}
              {activeChapter === 'swarm' && <SwarmChapter />}
              {activeChapter === 'recon' && <ReconChapter />}
              {activeChapter === 'evade' && <EvadeChapter />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// CHAPTER COMPONENTS
// ----------------------------------------------------------------------

const CoreChapter = () => (
  <>
    <div className="border-b border-white/10 pb-8 break-words">
      <h1 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">Visual Graph Mapping</h1>
      <p className="text-xl text-white/50 font-medium">Navigating your cognitive database organically.</p>
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
        <Terminal className="w-5 h-5 text-accent" /> The Force Simulation Web
      </h2>
      <p className="text-sm text-white/70">
        In traditional research, documents live in static folders. Within <b>RESEARCHAI</b>, isolated facts natively resolve into interactive neural clusters using D3 physics and Barnes-Hut algorithmic simulations. The Graph Map is your primary workspace.
      </p>

      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-3">Core Mechanics</h3>
        <ul className="space-y-3 text-sm text-white/70 list-disc ml-5">
          <li><b className="text-white">Panning and Zooming:</b> Treat the canvas like a mapping tool. Use your mouse wheel/trackpad to deeply inspect semantic clusters or zoom out to survey the 'bird's eye' view.</li>
          <li><b className="text-white">Draggable Nodes:</b> The physics engine dynamically pins nodes when you drag them. If you drop a node, it locks into place, allowing you to manually sculpt your architectural diagrams.</li>
          <li><b className="text-white">Neural Connections (Links):</b> Nodes automatically tether to each other using collision and charge forces. Green dashed links represent <i>supportive validation</i>, while red dashed links represent <i>contradictions</i> found during AI scans.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white mt-12">Dynamic Scale Radius</h2>
      <p className="text-sm text-white/70">
        Not all knowledge is equal. The D3 engine automatically pulls a <code>val</code> (volume) integer from your LanceDB memory nodes during REST calls. Nodes that have multiple internal connections or high citation rates will physically inflate in diameter on your canvas, acting as "Gravitational Core Nodes". 
      </p>

      <div className="p-5 border-l-2 border-accent bg-accent/5 rounded-r-xl">
        <p className="text-xs text-white/60 italic">
          <b>Pro Tip:</b> Clicking on any given Node will open the HUD detail panel in the top-right corner. You can directly navigate to the Source PDF or view the full Agentic log of why that particular node was injected.
        </p>
      </div>
    </div>
  </>
);

const SwarmChapter = () => (
  <>
    <div className="border-b border-white/10 pb-8 break-words">
      <h1 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">Agent Orchestrator</h1>
      <p className="text-xl text-white/50 font-medium">Controlling the continuous background intelligence swarm.</p>
    </div>

    <div className="space-y-6">
      <p className="text-sm text-white/70">
        The backend engine isn't just a basic CRUD API; it is an active swarm built using FastAPI and long-polling Websockets. The <code>Orchestrator</code> is responsible for evaluating, fetching, summarizing, and linking data together synchronously while you visually interact with the platform.
      </p>

      <h3 className="text-lg font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">The Cycle Pattern</h3>
      <ol className="space-y-4 text-sm text-white/70 list-decimal ml-5 marker:font-black marker:text-accent">
        <li><b>Query Initialized:</b> You submit an intent (i.e. "Find papers on Quantum Supremacy").</li>
        <li><b>Broadcast Sync:</b> The Python <code>ConnectionManager</code> pushes a WebSocket payload instantly alerting your frontend that Swarm threads are spinning up.</li>
        <li><b>Parallel Execution:</b> <code>BaseAgent</code> subclasses query local LanceDB clusters, execute Python runtime code, and ping semantic servers concurrently using ThreadPool Executors.</li>
        <li><b>Knowledge Ingestion:</b> Outputs are broken down into discrete structural Nodes in the persistent SQLite/VectorDB tier and piped to your global Zustand React store.</li>
      </ol>

      <div className="bg-black border border-white/10 rounded-2xl p-6 mt-8 shadow-2xl">
        <h4 className="text-xs font-black tracking-widest text-white/40 uppercase mb-4">Under The Hood: Payload Structure</h4>
        <pre className="text-xs text-white/60 font-mono bg-transparent">
{`{
  "event": "node_ingested",
  "payload": {
    "id": "arxiv_2026.0411",
    "type": "paper",
    "metadata": {
       "confidence_score": 0.94,
       "resolved_by": "SwarmAgent_V2",
       "timestamp": "1776483088"
    }
  }
}`}
        </pre>
      </div>
    </div>
  </>
);

const ReconChapter = () => (
  <>
    <div className="border-b border-white/10 pb-8 break-words">
      <h1 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">Literature Recon</h1>
      <p className="text-xl text-white/50 font-medium">Automating spatial discovery like Semantic Scholar and Litmaps.</p>
    </div>

    <div className="space-y-6">
      <p className="text-sm text-white/70">
        Stop wandering aimlessly through 50 Chrome tabs of Wikipedia and PDF files. The <b>Literature Recon Suite</b> gives you enterprise toolage to spider-crawl related documentation autonomously based on the current context of your active graph.
      </p>

      <h2 className="text-xl font-bold text-white">Using "Add to Canvas"</h2>
      <p className="text-sm text-white/70">
        When initiating a <b>Discovery</b> pass, the system hits public ArXiv frameworks and generates visual candidate cards. These aren't saved to your database yet. 
        When you evaluate the abstract and click <b>ADD TO CANVAS</b>, the item is natively injected into your local persistent environment. 
      </p>

      <div className="p-5 border-l-2 border-emerald-400 bg-emerald-400/5 rounded-r-xl my-6">
        <p className="text-xs text-emerald-400/90 font-medium">
          <b>State Syncing:</b> If you have an active Node selected on the primary Graph map while clicking "Add to Canvas", the system automatically generates an irreversible neural link mapping the discovery to your selected node. 
        </p>
      </div>

      <h2 className="text-xl font-bold text-white pt-6">Deploying Sentinels (Monitor Rule)</h2>
      <p className="text-sm text-white/70">
        You can configure a long-standing keyword tracker on the Recon dashboard. Enter your subject parameters and click <b>Deploy Sentinel</b>. The query translates into a background Cron job within your Zustand store state, rendering a pulsing green tracker widget that actively listens for web hooks.
      </p>
      
      <h2 className="text-xl font-bold text-white pt-6">Rendering Snapshot Links</h2>
      <p className="text-sm text-white/70">
        Need to send your graph state to a professor? In the <i>Share Link</i> block, click Generate Snapshot. The React architecture packages your exact node topology string, encodes it, and caches a stateless URL you can natively copy to your clipboard.
      </p>
    </div>
  </>
);

const EvadeChapter = () => (
  <>
    <div className="border-b border-white/10 pb-8 break-words">
      <h1 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">Ghostwriter Evasion</h1>
      <p className="text-xl text-white/50 font-medium">Evading external AI detectors via heuristic token manipulation.</p>
    </div>

    <div className="space-y-6">
      <p className="text-sm text-white/70 leading-relaxed">
        Modern AI models are inherently deterministic in their syntax. Plagiarism detectors like <b>Quillbot</b>, <b>Turnitin</b>, and <b>GPTZero</b> don't look for magical watermarks—they perform standard distribution analyses evaluating text <i>Burstiness</i> (sentence length variance) and <i>Perplexity</i> (the randomness of word pairings). Our Ghostwriter Suite structurally manipulates text to forcefully bypass these mathematical thresholds.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="p-6 bg-black border border-white/10 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center mb-4">
             <span className="text-red-500 text-xs font-black">AI</span>
          </div>
          <h3 className="text-sm font-bold text-white mb-2">The "AI" Tell</h3>
          <p className="text-xs text-white/50 line-clamp-3">Sentences are mathematically uniform, consistently averaging 15-22 words. Output constantly employs highly probable transition phrases like <i>"In conclusion"</i> or <i>"Moreover"</i>.</p>
        </div>
        <div className="p-6 bg-black border border-white/10 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex flex-col items-center justify-center mb-4">
             <span className="text-emerald-400 text-xs font-black">H</span>
          </div>
          <h3 className="text-sm font-bold text-white mb-2">The "Human" Proof</h3>
          <p className="text-xs text-white/50 line-clamp-3">High Burstiness indices. Massive multi-clause technical sentences abruptly followed by extreme brevity. Uses sub-optimal grammatical structure logically placed.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white">Using the HUMANIZE Engine</h2>
      <p className="text-sm text-white/70">
        To use the humanizer tool:
      </p>
      <ol className="space-y-4 text-sm text-white/70 list-decimal ml-5 mt-4">
        <li>Paste your output document directly into the editor terminal.</li>
        <li>Select a definitive Tone (<b>Academic</b> vs <b>Conversational</b> alters the specific prefix dictionary pool).</li>
        <li>Execute <b>HUMANIZE</b>. The agent will run its heuristic models over your text. If your cloud API keys are disconnected, the platform will utilize an internal <i>deterministic mutation algorithm</i> to aggressively chop your sentence components and inject raw transitional artifacts.</li>
        <li>Once finished, the <b>Plagiarism Scan</b> dashboard will evaluate the mutated strings. When the AI Confidence drops below 20%, you will receive the global green verification badge—meaning it is perfectly safe to export to external channels.</li>
      </ol>

    </div>
  </>
);
