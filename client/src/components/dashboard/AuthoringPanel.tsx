"use client";
import React, { useState } from 'react';
import { PenTool, ShieldAlert, Sparkles, RefreshCcw, CheckCircle, Fingerprint, BookOpen, FileText, Search, Plus, MessageSquare, Lightbulb, Type, AlignLeft, BarChart, History, X, ChevronRight, ChevronLeft, Settings, LayoutTemplate, MessageCircle, MoreHorizontal, Layers, ChevronDown, UploadCloud, Music, Ear, Quote, Activity, Brain, Home, MessageSquareQuote, MessageSquareText, Gauge, FileSearch, GitBranch, Cloud, Kanban, Share, Download, Wifi } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const TOP_VENUES = [
  { id: "None", name: "Generic / No Venue" },
  { id: "NeurIPS", name: "NeurIPS", constraints: "9 pages max (excluding refs)." },
  { id: "ICML", name: "ICML", constraints: "8 pages max (excluding refs)." },
  { id: "ICLR", name: "ICLR", constraints: "9 pages max." },
];

const DOC_TYPES = ["General", "Academic", "Business", "Technical", "Creative", "Casual", "Web", "Script"];

const FEATURE_DESCRIPTIONS: Record<string, { title: string, desc: string }> = {
  'Citations': { title: 'Research Library', desc: 'Access your research references, citations, and phrasebanks to inject directly into your document.' },
  'Manchester': { title: 'Manchester Phrasebank', desc: 'Academic phrasebank providing established framing phrases for research writing.' },
  'Structure': { title: 'Sentence Structure Check', desc: 'Compare the frequency of your different sentence starts with other published texts in your genre. Varied sentence structures can emphasize words and keep your reader engaged.' },
  'Combo': { title: 'Combo Check', desc: 'Create a custom report to analyze the areas of writing you want to focus on.' },
  'Readability': { title: 'Readability Check', desc: 'Review a series of readability measures for your text, like estimated reading time. Spot difficult-to-read paragraphs, and determine if your writing is suitable for your intended audience.' },
  'Grammar': { title: 'Grammar Check', desc: 'Polish your writing by fixing any issues with spelling, grammar, and punctuation.' },
  'Style': { title: 'Writing Style Check', desc: 'Identify improvements in 10+ areas of writing, such as clarity, adverb usage, hidden verbs, lengthy subordinate clauses, and more.' },
  'Length': { title: 'Sentence Length Check', desc: 'See the number of words, characters, and a visual representation of the sentence lengths in your writing. Vary the sentence lengths to maintain the interest of the reader.' },
  'Sticky': { title: 'Sticky Sentences Check', desc: 'Identify sentences with 40% or more glue words that slow your reader down. Glue words are the top 200 most common words in English.' },
  'Pacing': { title: 'Pacing Check', desc: 'Identify the pacing in your writing. If you have too many slower paced paragraphs in a row, your writing may be boring.' },
  'Consistency': { title: 'Consistency Check', desc: 'Identify inconsistencies in spelling, hyphenation, capitalisation, and more.' },
  'Repeats': { title: 'Repeats Check', desc: 'Identify repeated words and phrases to avoid reiterating the same actions or descriptions.' },
  'Echoes': { title: 'Echoes Check', desc: 'Identify and replace repeated words close together to prevent echoing in the reader’s mind.' },
  'All Repeats': { title: 'All Repeats Check', desc: 'Identify all repeated words and phrases across your entire document.' },
  'Transition': { title: 'Transitions Check', desc: 'Identify the transitions in your writing. Transitions help organize ideas.' },
  'Cliches': { title: 'Cliches & Redundancies', desc: 'Identify clichés and redundancies that make your writing unoriginal and less impactful.' },
  'Diction': { title: 'Diction Check', desc: 'Highlights vague and abstract words in your writing and provides suggestions on how you might revise them.' },
  'Pronoun': { title: 'Pronoun Check', desc: 'Avoid monotony by limiting the use of repetitive initial pronouns. Use other sentence openers.' },
  'Dialogue': { title: 'Dialogue Tags Check', desc: 'Identify dialogue tags and unusual dialogue tags.' },
  'Thesaurus': { title: 'Thesaurus Check', desc: 'Explore other vocabulary choices to enhance your vocabulary.' },
  'Rephrase': { title: 'Rephrase Report', desc: 'Uncover opportunities for rephrasing to make your text more engaging.' },
  'Overused': { title: 'Overused Words Check', desc: 'Compare the frequency of your commonly overused words with other published writing.' },
  'Critique': { title: 'Critique Report', desc: 'Get AI-driven high-level critique and structural feedback on your manuscript.' },
  'Realtime': { title: 'Realtime Checking', desc: 'Continuously monitor your document for basic issues as you type.' },
  'Alliteration': { title: 'Alliteration Check', desc: 'Identify instances of alliteration in your text to enhance rhythm and musicality.' },
  'Homonym': { title: 'Homonym Check', desc: 'Check for commonly confused words and homonyms to prevent embarrassing errors.' },
  'Acronym': { title: 'Acronym Check', desc: 'Ensure all acronyms are defined before use and applied consistently throughout the document.' },
  'Sensory': { title: 'Sensory Check', desc: 'Identify sensory language (sight, sound, touch, taste, smell) to make your writing more vivid.' },
  'House': { title: 'House Style Check', desc: "Check your document against your organization's custom house style rules." },
  'Plagiarism': { title: 'Plagiarism Check', desc: 'Scan your text against billions of web pages and academic papers to ensure originality.' },
};

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
  const [text, setText] = useState("");
  const [tone, setTone] = useState("Academic");
  const [venue, setVenue] = useState("NeurIPS");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'workspace'>('editor');
  const [isResearchTemplateOpen, setIsResearchTemplateOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{ ai_probability: number, human_probability: number, flagged_sentences: string[] } | null>(null);
  const [toolResponse, setToolResponse] = useState<{ title: string, content: string } | null>(null);
  const [toolLoading, setToolLoading] = useState<string | null>(null);
  
  const [leftSidebarTab, setLeftSidebarTab] = useState('Citations');
  const [isMoreReportsOpen, setIsMoreReportsOpen] = useState(false);
  const [isSummaryReportOpen, setIsSummaryReportOpen] = useState(false);
  
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
    if (!text) return;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleViewSample = () => {
    setText("On Waymo’s London Deployment: A Research Perspective\n\nWaymo’s announcement to deploy robotaxis in London next year marks a pivotal moment for Britain's autonomous mobility landscape—one that demands serious academic scrutiny rather than knee-jerk reactions.\n\nWhilst Prof. Siddartha Khastgir correctly emphasises that safety remains paramount, we must recognise that genuine safety validation cannot emerge from theoretical frameworks alone. It requires methodical, transparent, and rigorously instrumented real-world trials.");
  };

  const handleInsertCitation = (title: string) => setText((prev) => `${prev} [Citation: ${title}] `);

  const handleLinguisticTool = async (tool: string) => {
    if (tool === 'Research Template') {
      setIsResearchTemplateOpen(true);
      return;
    }
    if (tool === 'Summary') {
      setIsSummaryReportOpen(true);
      return;
    }
    
    setLeftSidebarTab(tool);
    setIsLeftPanelOpen(true);

    const customSidebarTools = ['Citations', 'Manchester', 'Structure', 'Combo'];
    if (customSidebarTools.includes(tool)) {
      return;
    }
    
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
          <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg ml-4">
            <button type="button" onClick={() => setActiveView('editor')} className={cn("px-3 py-1 text-xs font-bold rounded-md transition-colors", activeView === 'editor' ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-black dark:text-white" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white")}>Editor</button>
            <button type="button" onClick={() => setActiveView('workspace')} className={cn("px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors", activeView === 'workspace' ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-black dark:text-white" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white")}><Kanban className="w-3 h-3"/> Workspace</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={venue} onChange={(e) => setVenue(e.target.value)} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-foreground focus:outline-none">
            {TOP_VENUES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button type="button" onClick={handleHumanize} disabled={processing || !text} className="px-4 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-80 transition-all disabled:opacity-50">
            {processing ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
            HUMANIZE
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsShareModalOpen(true); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/60 dark:text-white/60 transition-colors">
            <Share className="w-4 h-4" />
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRightPanelOpen(!isRightPanelOpen); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/60 dark:text-white/60 transition-colors">
            {isRightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#080808] px-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
        <ToolGroup title="Plan" tools={[{name: 'Research Template', icon: LayoutTemplate, action: 'Research Template'}]} handleTool={handleLinguisticTool} loading={toolLoading} />
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
        ]} handleTool={handleLinguisticTool} loading={toolLoading} />
        
        {/* More Reports Dropdown */}
        <div className="flex items-center gap-1 pr-4 shrink-0 relative pt-3 pb-1 border-r border-black/10 dark:border-white/10 last:border-0">
           <span className="text-[8px] font-black uppercase text-black/30 dark:text-white/30 absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap">More</span>
           <div className="relative">
             <button type="button" onClick={() => setIsMoreReportsOpen(!isMoreReportsOpen)} className={cn("flex flex-col items-center gap-0.5 group opacity-100 transition-opacity min-w-[48px]", isMoreReportsOpen && "opacity-100")}>
                <div className={cn("p-1 rounded-md group-hover:bg-black/5 dark:group-hover:bg-white/5", isMoreReportsOpen && "bg-black/5 dark:bg-white/5")}>
                   <MoreHorizontal className="w-3.5 h-3.5 text-black/60 dark:text-white/60 group-hover:text-accent transition-colors" />
                </div>
                <span className="text-[8px] font-medium text-black/60 dark:text-white/60">More Reports</span>
             </button>
             {isMoreReportsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreReportsOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 py-2 flex flex-col">
                    {[
                      {name: 'Alliteration', icon: Music},
                      {name: 'Homonym', icon: Ear},
                      {name: 'Consistency', icon: MessageSquareQuote},
                      {name: 'Acronym', icon: MessageSquareText},
                      {name: 'Dialogue', icon: MessageCircle},
                      {name: 'Pacing', icon: Gauge},
                      {name: 'Sensory', icon: Brain},
                      {name: 'House', icon: Home},
                      {name: 'Plagiarism', icon: FileSearch},
                    ].map(report => (
                       <button type="button" key={report.name} onClick={() => { handleLinguisticTool(report.name); setIsMoreReportsOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-left text-xs font-medium w-full">
                         <report.icon className="w-4 h-4 text-black/50 dark:text-white/50" />
                         {report.name}
                       </button>
                    ))}
                  </div>
                </>
             )}
           </div>
        </div>
      </div>

      {activeView === 'editor' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
        <div className={cn("bg-white/50 dark:bg-[#080808] border-r border-black/10 dark:border-white/10 flex flex-col transition-all duration-300", isLeftPanelOpen ? "w-64" : "w-0 border-r-0")}>
          <div className="w-64 flex flex-col h-full opacity-100 overflow-hidden shrink-0">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex flex-col shrink-0 gap-3">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-black tracking-tight">{FEATURE_DESCRIPTIONS[leftSidebarTab]?.title || 'Research Library'}</span>
                 <button type="button" className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"><Plus size={14} /></button>
              </div>
              <p className="text-[10px] text-black/60 dark:text-white/60 leading-relaxed">
                 {FEATURE_DESCRIPTIONS[leftSidebarTab]?.desc || 'Access your research references, citations, and phrasebanks to inject directly into your document.'} <a href="#" className="underline font-bold text-accent">Read more</a>
              </p>
              
              <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg mt-1 overflow-x-auto no-scrollbar">
                 {['Citations', 'Structure', 'Combo'].map(tab => (
                   <button type="button" key={tab} onClick={() => setLeftSidebarTab(tab)} className={cn("flex-1 min-w-[60px] text-[10px] font-bold py-1.5 rounded-md transition-colors", leftSidebarTab === tab ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-black dark:text-white" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white")}>{tab}</button>
                 ))}
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="relative mb-3">
                <Search className="w-3 h-3 absolute left-2.5 top-2 text-black/40 dark:text-white/40" />
                <input type="text" placeholder="Search across documents..." className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md py-1.5 pl-8 pr-2 text-xs focus:outline-none" />
              </div>
              {leftSidebarTab === 'Citations' ? (
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
              ) : leftSidebarTab === 'Structure' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="p-3 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                         <div className="flex-1">
                           <p className="text-[10px] font-medium leading-tight">70% of sentences start with a subject (compared to 61% in published writing).</p>
                         </div>
                         <ChevronDown className="w-3 h-3 text-black/40 dark:text-white/40" />
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                         <div className="flex-1">
                           <p className="text-[10px] font-medium leading-tight">5% of sentences start with an adverb (compared to 9% in published writing).</p>
                         </div>
                         <ChevronDown className="w-3 h-3 text-black/40 dark:text-white/40" />
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                         <div className="flex-1">
                           <p className="text-[10px] font-medium leading-tight text-black/60 dark:text-white/60">0% of sentences start with a gerund. You might want to consider adding some.</p>
                         </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                         <div className="flex-1">
                           <p className="text-[10px] font-medium leading-tight text-black/60 dark:text-white/60">0% of sentences start with an infinitive. You might want to consider adding some.</p>
                         </div>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                         <div className="flex-1">
                           <p className="text-[10px] font-medium leading-tight">23% of sentences start with a subordinate conjunction (compared to 17% in published writing).</p>
                         </div>
                         <ChevronDown className="w-3 h-3 text-black/40 dark:text-white/40" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : leftSidebarTab === 'Combo' ? (
                <div className="space-y-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] font-medium">No cliches in dialogue</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] font-medium">No cliches outside dialogue</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] font-medium">Redundancies</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[10px] font-medium">Slow pacing paragraphs: 0%</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[10px] font-medium">Num words (49)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[10px] font-medium">Num characters (342)</span>
                    </div>
                    <div className="p-2 bg-red-500/5 border border-red-500/20 rounded-md mb-1">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[10px] font-medium">Avg Sentence Length (23.0)</span>
                          <span className="text-[9px] text-black/50 dark:text-white/50 block">target 11 to 18</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-black/40 dark:text-white/40" />
                      </div>
                    </div>
                    <div className="p-2 bg-red-500/5 border border-red-500/20 rounded-md mb-1">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[10px] font-medium">Sentence variety 1.2</span>
                          <span className="text-[9px] text-black/50 dark:text-white/50 block">target over 3</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-black/40 dark:text-white/40" />
                      </div>
                      <div className="mt-2 pl-3">
                        <span className="text-[9px] font-bold block mb-1">Sentences by Word Count</span>
                        <div className="flex items-center gap-2 text-[9px]">
                           <span className="w-12">20 - 29 (2)</span>
                           <div className="h-4 bg-red-200 dark:bg-red-900 w-16 flex items-center px-1">2</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div onClick={() => handleInsertCitation('As X suggests, ')} className="p-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm cursor-pointer hover:border-accent">
                    <p className="text-[10px] font-medium leading-tight">As X suggests, ...</p>
                  </div>
                  <div onClick={() => handleInsertCitation('Recent evidence indicates that ')} className="p-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm cursor-pointer hover:border-accent">
                    <p className="text-[10px] font-medium leading-tight">Recent evidence indicates that ...</p>
                  </div>
                  <div onClick={() => handleInsertCitation('A key problem with much of the literature is that ')} className="p-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm cursor-pointer hover:border-accent">
                    <p className="text-[10px] font-medium leading-tight">A key problem with much of the literature is that ...</p>
                  </div>
                  <div onClick={() => handleInsertCitation('The study highlights the importance of ')} className="p-2 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg shadow-sm cursor-pointer hover:border-accent">
                    <p className="text-[10px] font-medium leading-tight">The study highlights the importance of ...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Editor */}
        <div className="flex-1 bg-white dark:bg-[#111] relative overflow-hidden flex flex-col min-w-0">
          {!text && (
            <div className="absolute inset-0 p-8 md:p-12 pointer-events-none flex flex-col justify-start z-10 text-black/50 dark:text-white/50 font-serif">
              <p className="text-lg mb-4">Start typing to begin writing.</p>
              <p className="text-lg mb-4">Use ⌘+V to paste.</p>
              <p className="text-lg mb-6">Or try one of the following:</p>
              <div className="flex flex-wrap items-center gap-4 pointer-events-auto z-20 relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.md,.pdf,.doc,.docx,.rtf" 
                  className="hidden" 
                />
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsImportModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 border border-black/20 dark:border-white/20 rounded-md bg-white dark:bg-[#111] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-sans font-medium text-black dark:text-white transition-colors cursor-pointer">
                  <UploadCloud className="w-4 h-4" /> Import document
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewSample(); }} className="flex items-center gap-2 px-4 py-2 border border-black/20 dark:border-white/20 rounded-md bg-white dark:bg-[#111] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-sans font-medium text-black dark:text-white transition-colors cursor-pointer">
                  <FileText className="w-4 h-4" /> View a sample
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsResearchTemplateOpen(true); }} className="flex items-center gap-2 px-4 py-2 border border-black/20 dark:border-white/20 rounded-md bg-white dark:bg-[#111] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-sans font-medium text-black dark:text-white transition-colors">
                  <Lightbulb className="w-4 h-4" /> Test your research idea
                </button>
              </div>
              <p className="mt-8 text-sm leading-relaxed max-w-2xl font-sans text-black/40 dark:text-white/40">
                Once you've entered some text, the summary report is a good place to start, or the other reports will show suggestions directly in your text.
              </p>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full p-8 md:p-12 text-black/90 dark:text-white/90 font-serif text-lg leading-loose resize-none focus:outline-none bg-transparent relative z-0"
            spellCheck={false}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
             <button type="button" onClick={handleScan} disabled={processing || !text} className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2 backdrop-blur-md">
               <ShieldAlert size={14} /> Run Deep Scan
             </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={cn("bg-white/50 dark:bg-[#080808] border-l border-black/10 dark:border-white/10 transition-all duration-300 flex flex-col", isRightPanelOpen ? "w-72 lg:w-80" : "w-0 border-l-0")}>
          <div className="w-72 lg:w-80 flex flex-col h-full opacity-100 overflow-hidden shrink-0">
            <div className="flex items-center border-b border-black/10 dark:border-white/10 shrink-0 bg-white dark:bg-[#0a0a0a]">
              <button type="button" onClick={() => setRightPanelTab('Goals')} className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors", rightPanelTab === 'Goals' ? "border-b-2 border-accent text-accent" : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5")}>Goals</button>
              <button type="button" onClick={() => setRightPanelTab('Settings')} className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors", rightPanelTab === 'Settings' ? "border-b-2 border-accent text-accent" : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5")}>Settings</button>
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
                    <p className="text-[9px] text-black/50 dark:text-white/50 leading-relaxed">Here you can customize your application settings. You can create your own patterns to search for as well as add your own overused words.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-[10px] mb-1">Combo Reports</h4>
                    <p className="text-[9px] text-black/50 dark:text-white/50 mb-2">Select the reports that will appear in your combo report. Note: the more reports you include, the more complex your combo report will be to understand.</p>
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

                  <button type="button" className="w-full py-2 bg-accent text-white font-bold rounded-lg text-[10px] hover:opacity-90 transition-opacity shadow-sm">Save Settings</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 bg-[#fcfcfc] dark:bg-[#0a0a0a] overflow-y-auto p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-black">Project Workspace</h2>
              <p className="text-black/60 dark:text-white/60 text-sm mt-1">Weekly updates, automatic scope analysis, and task tracking.</p>
            </div>
            <button type="button" className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="w-4 h-4 text-accent" />
              Auto Scope Analysis
            </button>
          </div>
          <div className="flex items-start gap-6 overflow-x-auto pb-8 h-full max-w-6xl mx-auto w-full no-scrollbar">
             {/* Kanban Columns */}
             <div className="w-[320px] shrink-0 bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
               <h3 className="font-bold text-sm px-1">Backlog</h3>
               <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 text-sm cursor-pointer hover:border-accent/50 transition-colors">Draft Introduction Chapter</div>
               <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 text-sm cursor-pointer hover:border-accent/50 transition-colors">Review literature on high-order CBFs</div>
               <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 text-sm cursor-pointer hover:border-accent/50 transition-colors">Finalize experimental dataset for simulation</div>
               <button type="button" className="flex items-center gap-2 text-xs font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white p-2 transition-colors">
                 <Plus className="w-3 h-3" /> Add Task
               </button>
             </div>
             <div className="w-[320px] shrink-0 bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
               <h3 className="font-bold text-sm text-blue-500 px-1">In Progress</h3>
               <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 text-sm cursor-pointer hover:border-blue-500/50 transition-colors border-l-2 border-l-blue-500">Write FleetSafe Methodology</div>
               <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 text-sm cursor-pointer hover:border-blue-500/50 transition-colors border-l-2 border-l-blue-500">Respond to reviewer comments</div>
             </div>
             <div className="w-[320px] shrink-0 bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
               <h3 className="font-bold text-sm text-emerald-500 px-1">Done</h3>
               <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 text-sm opacity-60 line-through cursor-pointer">Compile NeurIPS Template</div>
             </div>
          </div>
        </div>
      )}

      {toolResponse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget) setToolResponse(null); }}>
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-t-2xl">
               <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> {toolResponse.title}</h3>
               <button type="button" onClick={() => setToolResponse(null)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
               <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap font-serif">{toolResponse.content}</p>
            </div>
            <div className="p-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-end gap-3 rounded-b-2xl">
               <button type="button" onClick={() => setToolResponse(null)} className="px-4 py-2 text-xs font-bold rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Close</button>
               <button type="button" onClick={() => { navigator.clipboard.writeText(toolResponse.content); setToolResponse(null); }} className="px-4 py-2 text-xs font-bold rounded-xl bg-black dark:bg-white text-white dark:text-black">Copy to Clipboard</button>
            </div>
          </div>
        </div>
      )}

      {isResearchTemplateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsResearchTemplateOpen(false); }}>
          <div className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden text-black dark:text-white font-sans">
            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between shrink-0">
               <h2 className="text-xl font-bold flex items-center gap-3">
                 <FileText className="w-5 h-5 text-cyan-400" /> Universal Research Template
               </h2>
               <button onClick={() => setIsResearchTemplateOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-black/60 dark:text-white/60" /></button>
            </div>
            
            {/* Tabs */}
            <div className="px-6 flex items-center gap-6 border-b border-black/10 dark:border-white/5 shrink-0">
               <button className="text-cyan-600 dark:text-cyan-400 font-bold text-sm pb-3 border-b-2 border-cyan-600 dark:border-cyan-400">Committed Plan</button>
               <button className="text-black/40 dark:text-white/40 font-bold text-sm pb-3 flex items-center gap-2 hover:text-black/60 dark:hover:text-white/60 transition-colors">
                 <Lightbulb className="w-4 h-4" /> Idea Formulation
               </button>
            </div>
            
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
               {/* Meta Fields */}
               <div className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Project Title</label>
                   <input type="text" placeholder="e.g. Autonomous Navigation Framework" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Prepared For</label>
                     <input type="text" placeholder="e.g. Dr. Jane Smith" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Prepared By</label>
                     <input type="text" placeholder="e.g. John Doe" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                   </div>
                 </div>
               </div>

               {/* Section 1 */}
               <div className="space-y-4">
                 <h3 className="text-cyan-600 dark:text-cyan-400 font-bold text-base mb-4 tracking-tight">1. Final Decision We Commit To</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Primary Backbone</label>
                     <input type="text" placeholder="e.g. Transformer Model X" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Secondary Baseline</label>
                     <input type="text" placeholder="e.g. ResNet Baseline" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Comparison Framework</label>
                     <input type="text" placeholder="e.g. Standard Comparison Model Y" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Task Focus</label>
                     <input type="text" placeholder="e.g. Safe navigation in human environments" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Fairness Rule</label>
                   <input type="text" placeholder="e.g. Match baseline inputs as closely as possible" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Main Contribution</label>
                   <input type="text" placeholder="e.g. Execution-time safety filtering under delay and uncertainty" className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors" />
                 </div>
               </div>

               {/* Section 2 */}
               <div className="space-y-4">
                 <h3 className="text-cyan-600 dark:text-cyan-400 font-bold text-base mb-4 tracking-tight">2. Research Idea Box</h3>
                 <div>
                   <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 tracking-wider uppercase mb-2">Motivation & Core Idea</label>
                   <textarea placeholder="e.g. I want to do an idea like AAA = Model X and BBB = Model Y..." className="w-full h-32 bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none transition-colors resize-none" />
                 </div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-black/10 dark:border-white/5 flex items-center justify-end gap-4 shrink-0 bg-black/5 dark:bg-[#161616]">
               <button onClick={() => setIsResearchTemplateOpen(false)} className="px-6 py-3 text-sm font-bold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Cancel</button>
               <button onClick={() => setIsResearchTemplateOpen(false)} className="px-8 py-3 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-black font-black text-sm rounded-xl hover:bg-cyan-600 dark:hover:bg-cyan-300 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                 <CheckCircle className="w-4 h-4" /> APPLY TO MISSION
               </button>
            </div>
          </div>
        </div>
      )}
      
      {isSummaryReportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsSummaryReportOpen(false); }}>
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-5xl h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 shrink-0">
               <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-accent" />
                 <h2 className="text-lg font-black tracking-tight">Summary Report</h2>
                 <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[10px] font-bold">Print</span>
               </div>
               <button onClick={() => setIsSummaryReportOpen(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 relative bg-[#fcfcfc] dark:bg-[#0a0a0a]">
               <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl flex items-start gap-3">
                 <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-accent mb-1">Tip! Your document is set to General.</p>
                   <p className="text-xs text-black/60 dark:text-white/60">You'll get better results if you choose a more specific genre.</p>
                 </div>
               </div>

               <div>
                 <h3 className="text-xl font-black mb-2">Your key scores</h3>
                 <p className="text-sm text-black/60 dark:text-white/60 mb-6">These are the most important scores for your document. Click the goal name to scroll to that section in the report.</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-black/10 dark:border-white/10 shadow-sm flex items-center justify-between">
                     <div>
                       <h4 className="text-sm font-bold text-black/60 dark:text-white/60">Grammar Score</h4>
                       <span className="text-3xl font-black text-emerald-500">100%</span>
                     </div>
                     <CheckCircle className="w-8 h-8 text-emerald-500/20" />
                   </div>
                   <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-black/10 dark:border-white/10 shadow-sm flex items-center justify-between">
                     <div>
                       <h4 className="text-sm font-bold text-black/60 dark:text-white/60">Spelling Score</h4>
                       <span className="text-3xl font-black text-emerald-500">100%</span>
                     </div>
                     <CheckCircle className="w-8 h-8 text-emerald-500/20" />
                   </div>
                   <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-black/10 dark:border-white/10 shadow-sm flex items-center justify-between">
                     <div>
                       <h4 className="text-sm font-bold text-black/60 dark:text-white/60">Style Score</h4>
                       <span className="text-3xl font-black text-emerald-500">100%</span>
                     </div>
                     <CheckCircle className="w-8 h-8 text-emerald-500/20" />
                   </div>
                 </div>
               </div>

               <div>
                 <h3 className="text-xl font-black mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Where your document looks great</h3>
                 <p className="text-sm text-black/60 dark:text-white/60 mb-6"><span className="font-bold text-emerald-500">83% of goals achieved</span>. These are areas where your document looks great.</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {name: "Glue Index", val: "20%"},
                      {name: "Passive Voice", val: "0.0"},
                      {name: "Engagement Score", val: "100%"},
                      {name: "Inclusive Language", val: "100%"},
                      {name: "Business Jargon", val: "0"},
                      {name: "Complex Paragraphs", val: "0%"},
                      {name: "Conjunction Starts", val: "0%"},
                      {name: "Slow Pacing", val: "0%"},
                    ].map(g => (
                      <div key={g.name} className="flex justify-between items-center p-3 border-b border-black/5 dark:border-white/5">
                        <span className="text-xs font-bold text-black/70 dark:text-white/70">{g.name}</span>
                        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">{g.val}</span>
                      </div>
                    ))}
                 </div>
               </div>

               <div>
                 <h3 className="text-xl font-black mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-orange-500" /> Where your document may need work</h3>
                 <p className="text-sm text-black/60 dark:text-white/60 mb-6">These are some areas of your document you might be able to improve.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">Sentence Length</span>
                        <span className="text-lg font-black text-orange-500">23.0</span>
                      </div>
                      <p className="text-xs text-black/60 dark:text-white/60">Reduce to between 11.0 and 18.0 words</p>
                    </div>
                    <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">Readability Grade</span>
                        <span className="text-lg font-black text-orange-500">23</span>
                      </div>
                      <p className="text-xs text-black/60 dark:text-white/60">Reduce to 10 or lower</p>
                    </div>
                    <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">Sentence Variety</span>
                        <span className="text-lg font-black text-orange-500">1.2</span>
                      </div>
                      <p className="text-xs text-black/60 dark:text-white/60">Increase to 4.0 or higher</p>
                    </div>
                    <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">-ing Starts</span>
                        <span className="text-lg font-black text-orange-500">50%</span>
                      </div>
                      <p className="text-xs text-black/60 dark:text-white/60">Reduce to less than 2%</p>
                    </div>
                 </div>
               </div>
               
               <div className="border-t border-black/10 dark:border-white/10 pt-12">
                 <h3 className="text-2xl font-black mb-8 text-center">Detailed Reports</h3>
                 
                 <div className="space-y-12">
                   <div>
                     <h4 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2"><Type className="w-5 h-5" /> Sentence Length Check</h4>
                     <p className="text-sm leading-relaxed mb-4 text-black/80 dark:text-white/80">Sentence length affects your reader's experience. Texts with lots of long sentences will exhaust your readers. On the other hand, texts with lots of short sentences will create a choppy, disjointed reading experience.</p>
                     <div className="bg-white dark:bg-[#111] p-6 border border-black/10 dark:border-white/10 rounded-xl">
                       <h5 className="font-bold mb-4 text-sm text-center">Sentence Lengths Distribution</h5>
                       <div className="flex items-end justify-center gap-2 h-40">
                         {/* Mock Chart */}
                         <div className="w-8 bg-blue-500 rounded-t-sm" style={{height: '20%'}}></div>
                         <div className="w-8 bg-blue-500 rounded-t-sm" style={{height: '80%'}}></div>
                         <div className="w-8 bg-blue-500 rounded-t-sm" style={{height: '50%'}}></div>
                         <div className="w-8 bg-blue-500 rounded-t-sm" style={{height: '10%'}}></div>
                       </div>
                       <div className="flex justify-center gap-2 mt-2 text-[10px] text-black/40 dark:text-white/40">
                         <span className="w-8 text-center">&lt;10</span>
                         <span className="w-8 text-center">10-19</span>
                         <span className="w-8 text-center">20-29</span>
                         <span className="w-8 text-center">30+</span>
                       </div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2"><PenTool className="w-5 h-5" /> Writing Style Check</h4>
                     <p className="text-sm leading-relaxed mb-4 text-black/80 dark:text-white/80">Your writing can have no spelling or grammar mistakes but still be awkward, clumsy, and hard to read. By accepting the style suggestions in your document, you can make your writing easier and more enjoyable to read.</p>
                     <div className="bg-white dark:bg-[#111] p-6 border border-black/10 dark:border-white/10 rounded-xl">
                       <h5 className="font-bold mb-4 text-sm text-center">Bad Adverbs Breakdown Per 1,000 Words</h5>
                       <div className="flex items-end justify-center gap-4 h-40">
                         {/* Mock Chart */}
                         <div className="flex gap-1 items-end">
                            <div className="w-4 bg-yellow-400 rounded-t-sm" style={{height: '90%'}}></div>
                            <div className="w-4 bg-blue-400 rounded-t-sm" style={{height: '20%'}}></div>
                         </div>
                         <div className="flex gap-1 items-end">
                            <div className="w-4 bg-yellow-400 rounded-t-sm" style={{height: '70%'}}></div>
                            <div className="w-4 bg-blue-400 rounded-t-sm" style={{height: '30%'}}></div>
                         </div>
                         <div className="flex gap-1 items-end">
                            <div className="w-4 bg-yellow-400 rounded-t-sm" style={{height: '50%'}}></div>
                            <div className="w-4 bg-blue-400 rounded-t-sm" style={{height: '10%'}}></div>
                         </div>
                       </div>
                       <div className="flex justify-center gap-4 mt-2 text-[10px] text-black/40 dark:text-white/40">
                         <span className="text-center">automatically</span>
                         <span className="text-center">directly</span>
                         <span className="text-center">simply</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsImportModalOpen(false); }}>
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 shrink-0">
               <h2 className="text-lg font-black tracking-tight">Import Document</h2>
               <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 gap-4 bg-[#fcfcfc] dark:bg-[#0a0a0a]">
               {/* Local Upload */}
               <button onClick={() => { fileInputRef.current?.click(); setIsImportModalOpen(false); }} className="flex items-start gap-4 p-4 border border-black/10 dark:border-white/10 rounded-xl hover:border-accent hover:bg-accent/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10">
                   <UploadCloud className="w-5 h-5 group-hover:text-accent transition-colors" />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm mb-1 group-hover:text-accent transition-colors">Upload Local File</h3>
                   <p className="text-xs text-black/60 dark:text-white/60">Import a .txt or .md file directly from your computer.</p>
                 </div>
               </button>

               {/* Platform Library */}
               <button onClick={() => { setText("Sample text loaded from Platform Library..."); setIsImportModalOpen(false); }} className="flex items-start gap-4 p-4 border border-black/10 dark:border-white/10 rounded-xl hover:border-accent hover:bg-accent/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10">
                   <BookOpen className="w-5 h-5 group-hover:text-accent transition-colors" />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm mb-1 group-hover:text-accent transition-colors">Platform Library</h3>
                   <p className="text-xs text-black/60 dark:text-white/60">Import from your previously saved Sovereign Studio manuscripts.</p>
                 </div>
               </button>

               {/* GitHub */}
               <button onClick={() => { alert('GitHub integration coming soon!'); }} className="flex items-start gap-4 p-4 border border-black/10 dark:border-white/10 rounded-xl hover:border-accent hover:bg-accent/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10">
                   <GitBranch className="w-5 h-5 group-hover:text-accent transition-colors" />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm mb-1 group-hover:text-accent transition-colors">GitHub Repository</h3>
                   <p className="text-xs text-black/60 dark:text-white/60">Sync markdown files directly from a linked GitHub repo.</p>
                 </div>
               </button>

               {/* Cloud Drive */}
               <button onClick={() => { alert('Cloud Drive integration coming soon!'); }} className="flex items-start gap-4 p-4 border border-black/10 dark:border-white/10 rounded-xl hover:border-accent hover:bg-accent/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10">
                   <Cloud className="w-5 h-5 group-hover:text-accent transition-colors" />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm mb-1 group-hover:text-accent transition-colors">Cloud Drive</h3>
                   <p className="text-xs text-black/60 dark:text-white/60">Import from Google Drive or Microsoft OneDrive.</p>
                 </div>
               </button>
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsShareModalOpen(false); }}>
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 shrink-0">
               <h2 className="text-lg font-black tracking-tight">Share & Export</h2>
               <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 gap-3 bg-[#fcfcfc] dark:bg-[#0a0a0a]">
               <button onClick={() => alert('Sending to AirDrop...')} className="flex items-center gap-3 p-3 border border-black/10 dark:border-white/10 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                   <Wifi className="w-4 h-4 text-blue-500" />
                 </div>
                 <h3 className="font-bold text-sm group-hover:text-blue-500 transition-colors">AirDrop</h3>
               </button>
               
               <button onClick={() => alert('Downloading PDF...')} className="flex items-center gap-3 p-3 border border-black/10 dark:border-white/10 rounded-xl hover:border-accent hover:bg-accent/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                   <Download className="w-4 h-4 text-accent" />
                 </div>
                 <h3 className="font-bold text-sm group-hover:text-accent transition-colors">Download PDF / DOCX</h3>
               </button>

               <button onClick={() => alert('Opening Mail...')} className="flex items-center gap-3 p-3 border border-black/10 dark:border-white/10 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/5 bg-white dark:bg-[#111] text-left transition-all group shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                   <MessageSquare className="w-4 h-4 text-emerald-500" />
                 </div>
                 <h3 className="font-bold text-sm group-hover:text-emerald-500 transition-colors">Send via Email</h3>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
