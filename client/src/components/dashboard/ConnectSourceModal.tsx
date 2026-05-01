import { useState, useRef, useEffect } from "react";
import { X, Code, Database, HardDrive, Globe, Loader2, Upload, FileText, CheckCircle, Plus, LogIn, ExternalLink, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

export const ConnectSourceModal = ({ isOpen, onClose, type }: ConnectSourceModalProps) => {
  const { addLog, setActiveSources } = useStore();
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"link" | "upload">("upload");
  const [notionMode, setNotionMode] = useState<"simple" | "advanced">("simple");
  const [gitMode, setGitMode] = useState<"simple" | "advanced">("simple");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    path: "",
    url: "",
    page_id: "",
    secret: "",
    name: "",
    token: ""
  });

  const isGit = ["github", "gitlab", "gitbucket"].includes(type);

  // HMR Resonance Trigger: Ensuring build parity
  useEffect(() => {
    if (isOpen) {
      console.log(`[Sovereign_Link] Synchronizing ${type.toUpperCase()} UI with Backend Resonance...`);
    }
  }, [isOpen, type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === "local" && uploadMode === "upload" && selectedFile) {
        // Handle File Upload
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        
        await axios.post("http://127.0.0.1:8000/api/sources/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        addLog({
          message: `Sovereign Import Success: ${selectedFile.name} added to archive.`,
          status: "success",
          timestamp: new Date().toISOString()
        });
      } else {
        // Handle Standard Linking
        const payload: any = { type };
        if (type === "local") payload.path = formData.path;
        if (isGit) {
            payload.url = formData.url;
            payload.token = formData.token;
        }
        if (type === "notion") {
          payload.page_id = formData.page_id;
          payload.secret = formData.secret;
        }
        payload.name = formData.name;

        await axios.post("http://127.0.0.1:8000/api/sources/link", payload);
        
        addLog({
          message: `Sovereign Source Connected: ${type.toUpperCase()} (${payload.name || payload.path || payload.url})`,
          status: "success",
          timestamp: new Date().toISOString()
        });
      }

      // Refresh sources
      const sourcesRes = await axios.get("http://127.0.0.1:8000/api/sources");
      setActiveSources(sourcesRes.data);
      
      onClose();
    } catch (err: any) {
      addLog({
        message: `Source connection failed: ${err.message}`,
        status: "error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white dark:bg-[#0a0a0a]ccent/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0a0a0a]ccent/10 border border-accent/20 flex items-center justify-center">
              {type === 'github' && <Code className="w-5 h-5 text-accent" />}
              {type === 'gitlab' && <GitBranch className="w-5 h-5 text-accent" />}
              {type === 'gitbucket' && <Code className="w-5 h-5 text-accent" />}
              {type === 'notion' && <Database className="w-5 h-5 text-accent" />}
              {type === 'local' && <HardDrive className="w-5 h-5 text-accent" />}
              {type === 'web' && <Globe className="w-5 h-5 text-accent" />}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Connect {type}</h2>
              <p className="text-[10px] text-black/60 dark:text-white/40 uppercase font-black tracking-widest">Sovereign_Link_Terminal</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-black/40 dark:text-white/20" />
          </button>
        </div>

        {type === "local" && (
            <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl mb-6 border border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setUploadMode("upload")}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    uploadMode === "upload" ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/20 hover:text-black/60 dark:text-white/40"
                  )}
                >
                    Import File
                </button>
                <button 
                  onClick={() => setUploadMode("link")}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    uploadMode === "link" ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/20 hover:text-black/60 dark:text-white/40"
                  )}
                >
                    Link Folder
                </button>
            </div>
        )}

        {isGit && (
           <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl mb-6 border border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setGitMode("simple")}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    gitMode === "simple" ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/20 hover:text-black/60 dark:text-white/40"
                  )}
                >
                    One-Click Access
                </button>
                <button 
                  onClick={() => setGitMode("advanced")}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    gitMode === "advanced" ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/20 hover:text-black/60 dark:text-white/40"
                  )}
                >
                    Personal Token
                </button>
            </div>
        )}

        {type === "notion" && (
           <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl mb-6 border border-black/5 dark:border-white/5">
              <button 
                onClick={() => setNotionMode("simple")}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  notionMode === "simple" ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/20 hover:text-black/60 dark:text-white/40"
                )}
              >
                  Direct Access
              </button>
              <button 
                onClick={() => setNotionMode("advanced")}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  notionMode === "advanced" ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/20 hover:text-black/60 dark:text-white/40"
                )}
              >
                  Integration Secret
              </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {type === 'local' && uploadMode === 'upload' ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 bg-white/[0.02] border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-accent/40 hover:bg-white/[0.04] transition-all cursor-pointer group p-6 text-center"
                >
                    <input 
                        type="file" 
                        aria-label="Select research file to import"
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    {selectedFile ? (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a0a0a]ccent/20 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black dark:text-white mb-1 truncate max-w-[200px]">{selectedFile.name}</p>
                                <p className="text-[10px] text-black/60 dark:text-white/40 uppercase font-black tracking-widest">Click to change</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:bg-[#0a0a0a]ccent/10 transition-colors">
                                <Upload className="w-6 h-6 text-black/40 dark:text-white/20 group-hover:text-accent transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black/70 dark:text-white/60 mb-1">Click to select research file</p>
                                <p className="text-[10px] text-black/40 dark:text-white/20 uppercase font-black tracking-widest">
                                    Supports PDF, DOCX, XLSX, IPYNB, GLB & more
                                </p>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/40 ml-1 mb-2 block">Friendly Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. PhD Research Repo"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-accent/40 transition-all font-bold"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
    
                {type === 'local' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/40 ml-1 mb-2 block">Directory Path</label>
                    <input 
                      type="text" 
                      placeholder="/Users/name/Desktop/Research"
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-accent/40 transition-all font-mono"
                      value={formData.path}
                      onChange={e => setFormData({...formData, path: e.target.value})}
                      required
                    />
                  </div>
                )}
                </>
            )}

            {isGit && gitMode === 'simple' && (
               <div className="p-6 bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-[2rem] text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a0a0a]ccent/20 flex items-center justify-center mx-auto">
                      <LogIn className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                      <p className="text-sm font-bold text-black dark:text-white mb-2">Sovereign {type.toUpperCase()} Link</p>
                      <p className="text-[10px] text-black/60 dark:text-white/40 uppercase font-black tracking-widest leading-relaxed">
                          Securely link your {type} repositories with one click.
                          Your research indices will synchronize sovereignly across all branches.
                      </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                        const url = type === 'github' ? 'https://github.com/settings/tokens' : 
                                   type === 'gitlab' ? 'https://gitlab.com/-/profile/personal_access_tokens' : 
                                   'https://gitbucket.com/settings';
                        window.open(url);
                    }}
                    className="flex items-center gap-2 text-[10px] text-accent font-black uppercase tracking-widest hover:underline mx-auto"
                  >
                      Manage {type.toUpperCase()} Pulse <ExternalLink className="w-3 h-3" />
                  </button>
               </div>
            )}

            {isGit && gitMode === 'advanced' && (
              <>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/40 ml-1 mb-2 block">{type.toUpperCase()} Repository URL</label>
                        <input 
                            type="url" 
                            placeholder={`https://${type}.com/org/repo`}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-accent/40 transition-all font-mono"
                            value={formData.url}
                            onChange={e => setFormData({...formData, url: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/40 ml-1 mb-2 block">Personal Access Token</label>
                        <input 
                            type="password" 
                            placeholder="ghp_xxxxxxxx..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-accent/40 transition-all font-mono"
                            value={formData.token}
                            onChange={e => setFormData({...formData, token: e.target.value})}
                        />
                    </div>
                </div>
              </>
            )}

            {type === 'notion' && notionMode === 'simple' && (
               <div className="p-6 bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-[2rem] text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a0a0a]ccent/20 flex items-center justify-center mx-auto">
                      <LogIn className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                      <p className="text-sm font-bold text-black dark:text-white mb-2">Direct OAuth Access</p>
                      <p className="text-[10px] text-black/60 dark:text-white/40 uppercase font-black tracking-widest leading-relaxed">
                          Securely link your Notion account with one click.
                          You can then select specific pages to allow the Research Hub full access.
                      </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => window.open('https://www.notion.so/my-integrations')}
                    className="flex items-center gap-2 text-[10px] text-accent font-black uppercase tracking-widest hover:underline mx-auto"
                  >
                      Open My Integrations <ExternalLink className="w-3 h-3" />
                  </button>
               </div>
            )}

            {type === 'notion' && notionMode === 'advanced' && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/40 ml-1 mb-2 block">Page ID</label>
                  <input 
                    type="text" 
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-accent/40 transition-all font-mono"
                    value={formData.page_id}
                    onChange={e => setFormData({...formData, page_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/40 ml-1 mb-2 block">Integration Secret</label>
                  <input 
                    type="password" 
                    placeholder="secret_xxxxxxxx..."
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-accent/40 transition-all font-mono"
                    value={formData.secret}
                    onChange={e => setFormData({...formData, secret: e.target.value})}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || (type === 'local' && uploadMode === 'upload' && !selectedFile)}
            className="w-full bg-white dark:bg-[#0a0a0a]ccent text-black font-black uppercase tracking-[0.2em] py-5 rounded-[1.5rem] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(var(--accent-rgb),0.2)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                    {type === 'local' && uploadMode === 'upload' ? <CheckCircle className="w-5 h-5" /> : (
                        (type === 'notion' && notionMode === 'simple') || (isGit && gitMode === 'simple') ? <LogIn className="w-5 h-5" /> : <Plus className="w-5 h-5" />
                    )}
                    {type === 'local' && uploadMode === 'upload' ? "Initiate Import" : (
                        (type === 'notion' && notionMode === 'simple') || (isGit && gitMode === 'simple') ? `Sign In with ${type.toUpperCase()}` : "Initiate Linkage"
                    )}
                </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
