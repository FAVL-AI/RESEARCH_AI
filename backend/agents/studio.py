from .base import BaseAgent
import json

class PodcastAgent(BaseAgent):
    """Generates RESEARCHAI Intelligence Briefings (Conversational PhD Dialogue)."""
    
    def generate_script(self, topic: str, sources: list) -> str:
        prompt = f"""
Create a 'RESEARCHAI Intelligence Briefing' dialogue between a Principal Investigator (PI) and a Senior Researcher discussing: {topic}.

SOURCES: {json.dumps(sources[:5])}

Directives:
1. TONE: High-stakes industrial skepticism mixed with technical awe.
2. DIALOGUE: Fast-paced academic debate. The PI should challenge the Senior Researcher on methodology and industrial viability.
3. BRANDING: Start by saying "This is a RESEARCHAI Intelligence Briefing."
4. DEPTH: Avoid surface-level summaries. Discuss specific mathematical claims or architectural bottlenecks from the sources.
"""
        return self.ask_llm(prompt, "You are a RESEARCHAI Principal Investigator.")

class DeckAgent(BaseAgent):
    """Generates RESEARCHAI Executive Research Maps (Technical Slidedecks)."""
    
    def generate_slides(self, topic: str, sources: list) -> dict:
        prompt = f"""
Generate a 'RESEARCHAI Executive Research Map' (10-slide outline) for: {topic}.

SOURCES: {json.dumps(sources[:5])}

Requirements:
1. Framing: Target a CTO-level audience interested in industrial implementation.
2. Slide Components: Title, 4 technical bullets, and a 'Cognitive Visualization Strategy'.
3. Output: Clean JSON array of objects under the 'slides' key.
"""
        raw_json = self.ask_llm(prompt, "You are a RESEARCHAI Venture Strategist.")
        try:
            start = raw_json.find("{")
            end = raw_json.rfind("}") + 1
            return json.loads(raw_json[start:end])
        except:
            return {"slides": [], "error": "JSON parsing failed"}

class SMEAgent(BaseAgent):
    """Generates RESEARCHAI Cognitive Calibration Nodes (Advanced PhD Flashcards)."""
    
    def generate_flashcards(self, topic: str, sources: list) -> list:
        prompt = f"""
Generate 10 'RESEARCHAI Cognitive Calibration Nodes' (PhD Flashcards) for: {topic}.

Each node should target a specific technical concept or reproducibility detail.
Return as a JSON list of objects: [{"question": "...", "answer": "..."}].
"""
        raw_json = self.ask_llm(prompt, "You are a RESEARCHAI PhD Examiner.")
        try:
            start = raw_json.find("[")
            end = raw_json.rfind("]") + 1
            return json.loads(raw_json[start:end])
        except:
            return []
