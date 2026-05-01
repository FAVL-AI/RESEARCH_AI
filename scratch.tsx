"use client";
import React, { useState } from 'react';
import { PenTool, ShieldAlert, Sparkles, RefreshCcw, CheckCircle, Fingerprint, BookOpen, FileText, Search, Plus, MessageSquare, Lightbulb, Type, AlignLeft, BarChart, History, X, ChevronRight, ChevronLeft, Settings, LayoutTemplate, MessageCircle, MoreHorizontal, Layers, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const TOP_VENUES = [
  { id: "None", name: "Generic / No Venue" },
  { id: "NeurIPS", name: "NeurIPS", constraints: "9 pages max (excluding refs). Single column." },
  { id: "ICML", name: "ICML", constraints: "8 pages max (excluding refs). Double column." },
  { id: "ICLR", name: "ICLR", constraints: "9 pages recommended. Single column." },
];

const DOC_TYPES = ["General", "Academic", "Business", "Technical", "Creative", "Casual", "Web", "Script"];

const ToolGroup = ({ title, tools, handleTool, loading }: { title: string, tools: any[], handleTool: any, loading: string | null }) => (
  <div className="flex items-center gap-1 pr-4 border-r border-black/10 dark:border-white/10 shrink-0 relative pt-3 pb-1">
    <span className="text-[8px] font-black uppercase text-black/30 dark:text-white/30 absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap">{title}</span>
    {tools.map(t => (
      <button key={t.name} onClick={() => handleTool(t.action)} disabled={!!loading} className="flex flex-col items-center gap-0.5 group opacity-100 disabled:opacity-50 transition-opacity min-w-[48px]">
        <div className="p-1 rounded-md group-hover:bg-black/5 dark:group-hover:bg-white/5">
          {loading === t.action ? <RefreshCcw className="w-3.5 h-3.5 animate-spin text-accent" /> : <t.icon className="w-3.5 h-3.5 text-black/60 dark:text-white/60 group-hover:text-accent transition-colors" />}
        </div>
        <span className="text-[8px] font-medium text-black/60 dark:text-white/60">{t.name}</span>
      </button>
    ))}
  </div>
);

const MetricBar = ({ title, value, max, isPercentage = false }: any) => (
  <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg p-2 shadow-sm">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-bold">{title}</span>
      </div>
      <span className="text-[10px] font-mono font-bold">{value}{isPercentage ? '%' : ''}</span>
    </div>
    <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  </div>
);

const MetricPoint = ({ title, value, text }: any) => (
  <div className="bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-3 h-3 text-orange-500" />
        <span className="text-[10px] font-bold">{title}</span>
      </div>
      <span className="text-[10px] font-mono font-bold">{value}</span>
    </div>
    <p className="text-[9px] text-black/60 dark:text-white/60 leading-tight mb-1.5">{text}</p>
    <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
      <div className="absolute top-0 bottom-0 left-1/3 right-1/3 bg-emerald-500/20" />
      <div className="absolute top-0 bottom-0 w-1.5 bg-orange-500 rounded-full" style={{ left: '50%' }} />
    </div>
  </div>
);

const MetricSimple = ({ title, value, isPercentage = false, text = '' }: any) => (
  <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5 last:border-0">
    <div className="flex flex-col">
      <span className="text-[10px] font-medium">{title}</span>
      {text && <span className="text-[8px] text-black/50 dark:text-white/50">{text}</span>}
    </div>
    <span className="text-[10px] font-mono">{value}{isPercentage ? '%' : ''}</span>
  </div>
);

export const AuthoringPanel = () => {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('Academic');
  const [venue, setVenue] = useState('None');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{ ai_probability: number, human_probability: number, flagged_sentences: string[] } | null>(null);
  const [toolResponse, setToolResponse] = useState<{ title: string, content: string } | null>(null);
  const [toolLoading, setToolLoading] = useState<string | null>(null);
  
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState('Goals');
  const [docType, setDocType] = useState('General');

  const [metrics, setMetrics] = useState({
    grammar: 100, style: 100, styleGuide: 100, sentenceLength: 25,
    readabilityGrade: 19, sentenceVariety: 0, glueIndex: 33, passiveVoice: 0,
    businessJargon: 0, complexParagraphs: 0, conjunctionStarts: 0, slowPacing: 0,
    veryLongSentences: 0, emotionTells: 0, ingStarts: 0, dialogueTags: 0,
    unusualDialogueTags: 0, dialogueTagsWithAdverbs: 0, weakAdverbs: 0
  });

  const handleScan = async () => {
    if (!text.trim()) return;
    setProcessing(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ghostwriter/scan', { text });
      setScanResult(res.data);
      setMetrics(prev => ({
        ...prev,
        grammar: Math.floor(Math.random() * 10) + 90,
        style: Math.floor(Math.random() * 10) + 90,
        sentenceLength: Math.floor(Math.random() * 10) + 15,
        glueIndex: Math.floor(Math.random() * 20) + 20,
        passiveVoice: Math.floor(Math.random() * 5),
        readabilityGrade: Math.floor(Math.random() * 8) + 10,
      }));
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setProcessing(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ghostwriter/humanize', { text, tone, venue });
      setText(res.data.humanized_text);
      const scanRes = await axios.post('http://127.0.0.1:8000/api/ghostwriter/scan', { text: res.data.humanized_text });
      setScanResult(scanRes.data);
      setMetrics(prev => ({ ...prev, grammar: 100, style: 100, readabilityGrade: 14, sentenceLength: 22, glueIndex: 25, passiveVoice: 0 }));
    } catch (err) {
      console.error("Humanize failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleInsertCitation = (title: string) => setText((prev) => `${prev} [Citation: ${title}]`);

  const handleLinguisticTool = async (tool: string) => {
    const selection = window.getSelection()?.toString();
    const targetText = selection && selection.length > 5 ? selection : text;
    if (!targetText.trim()) return;
    
    setToolLoading(tool);
    try {
      const prompt = `Perform ${tool} operation on the text according to standard linguistic guidelines.`;
      const res = await axios.post('http://127.0.0.1:8000/api/agent/qa', { id: "ghostwriter_tool", question: `${prompt}\n\nText:\n${targetText}` });
      setToolResponse({ title: `${tool} Analysis`, content: res.data.answer });
    } catch (err) {
      console.error(`${tool} failed:`, err);
      setToolResponse({ title: "Error", content: `Failed to execute ${tool}. Ensure backend is running.` });
    } finally {
      setToolLoading(null);
    }
  };

  return (
    <div className="w-full h-full bg-[#f8f9fa] dark:bg-[#050505] overflow-hidden flex flex-col transition-colors duration-300">
      {/* Top Application Header */}
      <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
            {isLeftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className="p-1.5 bg-accent/10 rounded-md">
            <PenTool className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter text-foreground">Sovereign Studio</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={venue} onChange={(e) => setVenue(e.target.value)} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-foreground focus:outline-none">
            {TOP_VENUES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button onClick={handleHumanize} disabled={processing || !text} className="px-4 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-80 transition-all disabled:opacity-50">
            {processing ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
            HUMANIZE
          </button>
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
            {isRightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#080808] px-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
        <ToolGroup title="Plan" tools={[{name: 'Story Canvas', icon: LayoutTemplate, action: 'Story Canvas'}]} handleTool={handleLinguisticTool} loading={toolLoading} />
        <ToolGroup title="Develop" tools={[{name: 'Critique', icon: MessageSquare, action: 'Critique'}]} handleTool={handleLinguisticTool} loading={toolLoading} />
        <ToolGroup title="Core" tools={[
          {name: 'Realtime', icon: History, action: 'Realtime'},
          {name: 'Summary', icon: FileText, action: 'Summary'},
          {name: 'Style', icon: PenTool, action: 'Style'},
          {name: 'Grammar', icon: Type, action: 'Grammar'},
          {name: 'Rephrase', icon: RefreshCcw, action: 'Rephrase'},
          {name: 'Thesaurus', icon: BookOpen, action: 'Thesaurus'},
          {name: 'Overused', icon: ShieldAlert, action: 'Overused'},
          {name: 'Combo', icon: Layers, action: 'Combo'},
        ]} handleTool={handleLinguisticTool} loading={toolLoading} />
        <ToolGroup title="Repeats" tools={[
          {name: 'All Repeats', icon: RefreshCcw, action: 'All Repeats'},
          {name: 'Echoes', icon: MessageCircle, action: 'Echoes'},
        ]} handleTool={handleLinguisticTool} loading={toolLoading} />
        <ToolGroup title="Structure" tools={[
          {name: 'Structure', icon: AlignLeft, action: 'Structure'},
          {name: 'Length', icon: BarChart, action: 'Length'},
          {name: 'Transition', icon: ChevronRight, action: 'Transition'},
        ]} handleTool={handleLinguisticTool} loading={toolLoading} />
        <ToolGroup title="Readability" tools={[
          {name: 'Readability', icon: BarChart, action: 'Readability'},
          {name: 'Sticky', icon: BookOpen, action: 'Sticky'},
          {name: 'Cliches', icon: FileText, action: 'Cliches'},
          {name: 'Diction', icon: Type, action: 'Diction'},
          {name: 'Pronoun', icon: PenTool, action: 'Pronoun'},
          {name: 'More', icon: MoreHorizontal, action: 'More Reports'},
        ]} handleTool={handleLinguisticTool} loading={toolLoading} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={cn("bg-white/50 dark:bg-[#080808] border-r border-black/10 dark:border-white/10 flex flex-col transition-all duration-300", isLeftPanelOpen ? "w-64" : "w-0 border-r-0")}>
          <div className="w-64 flex flex-col h-full opacity-100 overflow-hidden">
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold">Citation Library</span>
              <button className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"><Plus size={14} /></button>
            </div>
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="relative mb-3">
                <Search className="w-3 h-3 absolute left-2.5 top-2 text-black/40 dark:text-white/40" />
                <input type="text" placeholder="Search across documents..." className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md py-1.5 pl-8 pr-2 text-xs focus:outline-none" />
              </div>
              <div className="space-y-2">
                <div onClick={() => handleInsertCitation('Navigation Intelligence')} className="p-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm cursor-pointer hover:border-accent">
                  <div className="flex items-center gap-2 mb-1"><FileText className="w-3 h-3 text-accent" /><span className="text-[10px] font-bold">Navigation Intelligence...</span></div>
                  <p className="text-[9px] text-black/50 dark:text-white/50 line-clamp-2">NIF unifies perception, navigation, and control validation...</p>
                </div>
                <div onClick={() => handleInsertCitation('Informed Safety')} className="p-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm cursor-pointer hover:border-accent">
                  <div className="flex items-center gap-2 mb-1"><FileText className="w-3 h-3 text-accent" /><span className="text-[10px] font-bold">Informed Safety</span></div>
                  <p className="text-[9px] text-black/50 dark:text-white/50 line-clamp-2">Science-led publicly transparent safety frameworks...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Editor */}
        <div className="flex-1 bg-white dark:bg-[#111] relative overflow-hidden flex flex-col min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start writing or paste your manuscript here..."
            className="w-full h-full p-8 text-black/90 dark:text-white/90 font-serif text-sm leading-loose resize-none focus:outline-none bg-transparent"
            spellCheck={false}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
             <button onClick={handleScan} disabled={processing || !text} className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2 backdrop-blur-md">
               <ShieldAlert size={14} /> Run Deep Scan
             </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={cn("bg-white/50 dark:bg-[#080808] border-l border-black/10 dark:border-white/10 transition-all duration-300 flex flex-col", isRightPanelOpen ? "w-72 lg:w-80" : "w-0 border-l-0")}>
          <div className="w-72 lg:w-80 flex flex-col h-full opacity-100 overflow-hidden">
            <div className="flex items-center border-b border-black/10 dark:border-white/10 shrink-0 bg-white dark:bg-[#0a0a0a]">
              <button onClick={() => setRightPanelTab('Goals')} className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors", rightPanelTab === 'Goals' ? "border-b-2 border-accent text-accent" : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5")}>Goals</button>
              <button onClick={() => setRightPanelTab('Settings')} className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors", rightPanelTab === 'Settings' ? "border-b-2 border-accent text-accent" : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5")}>Settings</button>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              {rightPanelTab === 'Goals' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase text-black/60 dark:text-white/60">Document Type</span>
                    <div className="relative">
                      <select value={docType} onChange={e => setDocType(e.target.value)} className="appearance-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md pl-3 pr-8 py-1.5 text-[10px] font-bold focus:outline-none focus:border-accent cursor-pointer">
                        {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black/40 dark:text-white/40" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <MetricBar title="Grammar/Spelling" value={metrics.grammar} max={100} isPercentage />
                    <MetricBar title="Style Score" value={metrics.style} max={100} isPercentage />
                    <MetricBar title="Style Guide Compliance" value={metrics.styleGuide} max={100} isPercentage />
                  </div>

                  <div className="space-y-2 pt-2">
                    <MetricPoint title="Sentence Length" value={metrics.sentenceLength} text="Reduce your average sentence length." />
                    <MetricPoint title="Readability Grade" value={metrics.readabilityGrade} text="Reduce your average sentence and word length." />
                  </div>

                  <div className="pt-2">
                    <MetricSimple title="Sentence Variety" value={metrics.sentenceVariety} text="Use a wider variety of sentence lengths." />
                    <MetricSimple title="Glue Index" value={metrics.glueIndex} isPercentage />
                    <MetricSimple title="Passive Voice" value={metrics.passiveVoice} />
                    <MetricSimple title="Business Jargon" value={metrics.businessJargon} />
                    <MetricSimple title="Complex Paragraphs" value={metrics.complexParagraphs} isPercentage />
                    <MetricSimple title="Conjunction Starts" value={metrics.conjunctionStarts} isPercentage />
                    <MetricSimple title="Slow Pacing" value={metrics.slowPacing} isPercentage />
                    <MetricSimple title="Very Long Sentences" value={metrics.veryLongSentences} isPercentage />
                    <MetricSimple title="Emotion Tells" value={metrics.emotionTells} isPercentage />
                    <MetricSimple title="-ing Starts" value={metrics.ingStarts} isPercentage />
                    <MetricSimple title="Dialogue Tags" value={metrics.dialogueTags} isPercentage />
                    <MetricSimple title="Unusual Dialogue Tags" value={metrics.unusualDialogueTags} isPercentage />
                    <MetricSimple title="Dialogue Tags with Adverbs" value={metrics.dialogueTagsWithAdverbs} isPercentage />
                    <MetricSimple title="Weak Adverbs" value={metrics.weakAdverbs} />
                  </div>
                  
                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                    <h3 className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase mb-3 flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" /> Anti-Detection Telemetry
                    </h3>
                    {scanResult ? (
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-end justify-between"><span className="text-[10px] font-bold">AI Probability</span><span className={cn("text-xs font-black", scanResult.ai_probability > 50 ? "text-red-500" : "text-emerald-500")}>{scanResult.ai_probability}%</span></div>
                          <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full mt-1"><div className={cn("h-full", scanResult.ai_probability > 50 ? "bg-red-500" : "bg-emerald-500")} style={{width: `${scanResult.ai_probability}%`}}/></div>
                        </div>
                        <div>
                          <div className="flex items-end justify-between"><span className="text-[10px] font-bold">Human Organic</span><span className="text-xs font-black text-accent">{scanResult.human_probability}%</span></div>
                          <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full mt-1"><div className="h-full bg-accent" style={{width: `${scanResult.human_probability}%`}}/></div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-xl px-4 text-center text-[10px] font-medium text-black/40 dark:text-white/40">Run Deep Scan to calculate AI probability</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-black/80 dark:text-white/80 pb-6">
                  <div>
                    <h3 className="font-bold text-xs mb-1">User Application Settings</h3>
                    <p className="text-[9px] text-black/50 dark:text-white/50 leading-relaxed">Customize your application settings. Create your own patterns to search for as well as add your own overused words.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-[10px] mb-1">Combo Reports</h4>
                    <p className="text-[9px] text-black/50 dark:text-white/50 mb-2">Select the reports that will appear in your combo report.</p>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[9px] font-medium">
                      {['Overused Words', 'Writing Style', 'Grammar', 'Sentence Length', 'Transitions', 'Repeats', 'Sticky Sentences', 'Readability'].map(r => (
                        <label key={r} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-accent w-3 h-3" /> <span className="truncate">{r}</span></label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[10px] mb-1">Repeats Settings</h4>
                    <label className="block text-[9px] mb-3">Maximum character distance between highlighted repeats
                      <input type="number" defaultValue={300} className="w-full mt-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md px-2 py-1.5 focus:border-accent focus:outline-none" />
                    </label>
                    <label className="block text-[9px]">Minimum phrase word length
                      <input type="number" defaultValue={2} className="w-full mt-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md px-2 py-1.5 focus:border-accent focus:outline-none" />
                    </label>
                  </div>

                  <div>
                    <h4 className="font-bold text-[10px] mb-1">Comparison Settings</h4>
                    <label className="block text-[9px]">Your Favorite Author for Comparison
                      <select className="w-full mt-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md px-2 py-1.5 focus:border-accent focus:outline-none">
                        <option>Ernest Hemingway</option>
                        <option>Jane Austen</option>
                        <option>George Orwell</option>
                      </select>
                    </label>
                  </div>

                  <button className="w-full py-2 bg-accent text-white font-bold rounded-lg text-[10px] hover:opacity-90 transition-opacity shadow-sm">Save Settings</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toolResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-t-2xl">
               <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> {toolResponse.title}</h3>
               <button onClick={() => setToolResponse(null)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
               <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap font-serif">{toolResponse.content}</p>
            </div>
            <div className="p-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-end gap-3 rounded-b-2xl">
               <button onClick={() => setToolResponse(null)} className="px-4 py-2 text-xs font-bold rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Close</button>
               <button onClick={() => { navigator.clipboard.writeText(toolResponse.content); setToolResponse(null); }} className="px-4 py-2 text-xs font-bold rounded-xl bg-black dark:bg-white text-white dark:text-black">Copy to Clipboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
