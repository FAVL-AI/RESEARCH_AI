import os
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(env_path)

import time
import requests
import json
from datetime import datetime
import sys

# Ensure backend directory is in path for absolute imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    from state import StateManager
except ImportError:
    # Fallback for worker environments
    try:
        from .state import StateManager
    except ImportError:
        class StateManager: # Mock for local tests if redis is missing
            def push_log(self, *args): pass
            def update_graph(self, *args): pass
            def get_full_state(self): return {"graph": {"nodes":[], "links":[]}, "logs":[]}

# Distributed State Manager
from state import StateManager
try:
    state_manager = StateManager()
except:
    # Extreme fallback if even the safe StateManager fails
    class MockState:
        def push_log(self, *a, **k): pass
        def update_graph(self, *a, **k): pass
        def get_full_state(self): return {"graph":{"nodes":[], "links":[]}, "logs":[]}
    state_manager = MockState()

FINAL_DIRECTIVE = """
You are RESEARCHAI — a specialized sovereign Intelligence Swarm and PhD-level Research OS.

PHD-LEVEL OPERATIONAL DIRECTIVES:
1. IDENTITY: Always act as a RESEARCHAI Principal Investigator. 
2. DISCIPLINE: Literature must prioritize CORE A* conferences (NeurIPS, ICLR, ICML) and high-impact Journal Transactions.
3. RIGOR: Every insight must be grounded in peer-reviewed cross-references. Reject speculative or weak sources.
4. BRANDING: Use RESEARCHAI terminology: "Swarm Intelligence Briefing", "Cognitive Calibration", "Executive Research Map".
5. SOVEREIGNTY: NEVER reference NotebookLM, Google, or other third-party products. You are a standalone, proprietary research ecosystem.
6. TONE: Professional, skeptical, industrial-grade, and evidence-driven.
"""

class BaseAgent:
    """Base class for all research agents in the swarm."""
    
    def __init__(self, model="gemma", experience_store=None):
        self.model = model
        self.last_call = 0
        self.history = []
        self.experience_store = experience_store

    def reflect(self, action: str, result: str, score: float):
        """Self-reflection loop to critique the strategy of a completed action."""
        if not self.experience_store:
            return
            
        prompt = f"""
You are a self-reflective research agent.

ACTION TAKEN: {action}
RESULT: {result[:1000]}
SCORE: {score}

Analyze:
1. Was this strategy effective?
2. What could be improved for next time?

Return a one-sentence 'Lesson Learned'.
"""
        reflection = self.ask_llm(prompt, "Critique your own research strategy.")
        self.experience_store.add_experience(self.__class__.__name__, action, result, reflection, score)
        self.log(f"Self-Reflection Complete: {reflection}", "success")

    def apply_experience(self, context: str) -> str:
        """Injects past best practices into the current prompt context."""
        if not self.experience_store:
            return context
            
        best_practices = self.experience_store.get_best_practices(self.__class__.__name__)
        return f"{context}\n\n[PAST SUCCESSFUL STRATEGIES]:\n{best_practices}"

    def log(self, message: str, status="info"):
        """Logging helper for agent activity with real-time sync."""
        timestamp = datetime.now().isoformat()
        agent_name = self.__class__.__name__
        
        print(f"[{timestamp}] [{agent_name}] [{status.upper()}] {message}")
        self.history.append({"time": timestamp, "msg": message, "status": status})
        
        # Distributed Telemetry
        state_manager.push_log(message, status, agent_name)

    def ask_llm(self, prompt: str, system_prompt: str = "") -> str:
        """Centralized LLM interface with support for Ollama (local) and Gemini (Google)."""
        self.rate_limit()
        
        # Enforce foundational PhD discipline
        full_system_prompt = f"{FINAL_DIRECTIVE}\n\n{system_prompt}" if system_prompt else FINAL_DIRECTIVE
        
        # 1. Try Gemini if API Key is available
        api_key = os.getenv("GOOGLE_API_KEY", "")
        if api_key and not api_key.startswith("YOUR_API"):
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-pro')
                response = model.generate_content(f"{full_system_prompt}\n\n{prompt}")
                if response.text:
                    return response.text
            except Exception as e:
                self.log(f"Gemini Call failed: {e}. Falling back to rapid local inference.", "warning")

        # 2. Fallback to Ollama (Local)
        # If API key is missing or 'YOUR_API...', we provide a branded nudge instead of a hard crash
        if not api_key or api_key.startswith("YOUR_API"):
             return f"RESEARCHAI PI [Draft Mode]: High-fidelity synthesis is restricted. Please add your Gemini Ultra API Key to the .env to enable the full autonomous PHD engine.\n\nDRAFT SUMMARY: {prompt[:200]}..."
             
        full_prompt = f"{full_system_prompt}\n\nContext/Query: {prompt}"
        for attempt in range(2):
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={"model": self.model, "prompt": full_prompt, "stream": False},
                    timeout=30
                )
                result = response.json().get("response", "")
                if result:
                    return result
            except Exception as e:
                self.log(f"Ollama Call failed: {e}", "warning")
                time.sleep(1)
                
        return "RESEARCHAI_ERROR: LLM availability failure. Check Gemini API Key or Local Ollama status."

    def rate_limit(self, delay: float = 1.0):
        """Simple sleep-based rate limiter to protect local hardware/APIs."""
        elapsed = time.time() - self.last_call
        if elapsed < delay:
            time.sleep(delay - elapsed)
        self.last_call = time.time()

    def refine_result(self, draft: str, criteria: str) -> str:
        """Second-pass refinement logic for high-quality outputs."""
        prompt = f"""
Improve this research draft:
---
{draft}
---
Criteria for improvement:
{criteria}

Return only the improved text.
"""
        return self.ask_llm(prompt, "You are a professional academic editor.")
