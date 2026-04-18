import numpy as np
import json
from .base import BaseAgent

class CriticAgent(BaseAgent):
    """Agent responsible for verification and credibility scoring."""
    
    def __init__(self, model="gemma", experience_store=None):
        super().__init__(model=model, experience_store=experience_store)

    def structural_linking(self, p1: dict, p2: dict) -> list:
        """Find links between internal components of two papers."""
        s1 = p1.get("metadata", {}).get("structure", {})
        s2 = p2.get("metadata", {}).get("structure", {})
        
        if not s1 or not s2:
            return []
            
        prompt = f"""
Compare the internal structures of these two papers:

Paper A (Claims): {s1.get('claims')}
Paper B (Methods): {s2.get('methods')}
Paper B (Assumptions): {s2.get('assumptions')}

Task: Identify if Paper B's methods or assumptions support or challenge Paper A's claims.
Return a JSON list of links: [{{"source": "A", "target": "B", "type": "METHOD_VALIDATES", "reason": "..."}}]
"""
        raw_json = self.ask_llm(prompt, "You are a structural reasoning engine.")
        try:
            start = raw_json.find("[")
            end = raw_json.rfind("]") + 1
            if start != -1 and end != -1:
                links = json.loads(raw_json[start:end])
                self.reflect("Structural Linking", f"Between {p1['id']} and {p2['id']}", 0.95)
                return links
        except:
            return []
        return []
    
    def calculate_credibility(self, paper: dict) -> float:
        """Score paper quality based on metadata and AI critique."""
        meta = paper.get("metadata", {})
        
        # 1. Metric Score (40% weight)
        citations = meta.get("citationCount", 0)
        reference_score = min(1.0, citations / 100) if citations else 0
        
        # 2. AI Critique (60% weight)
        critique_prompt = f"""
Evaluate the academic rigor of this research:
Title: {paper.get('title')}
Abstract: {paper.get('content')}

Provide a single score from 0.0 (weak) to 1.0 (highly rigorous). 
Return ONLY the number.
"""
        try:
            ai_score_str = self.ask_llm(critique_prompt).strip()
            ai_score = float(ai_score_str) if ai_score_str else 0.5
        except:
            ai_score = 0.5
            
        final_score = (reference_score * 0.4) + (ai_score * 0.6)
        self.log(f"Credibility for '{paper['title'][:30]}...': {final_score:.2f}")
        return final_score

    def find_contradictions(self, p1: dict, p2: dict) -> dict:
        """Compare two papers for conflicting claims."""
        prompt = f"""
Compare these two claims:
A: {p1.get('content', '')[:500]}
B: {p2.get('content', '')[:500]}

Do they contradict, support, or are they independent?
Explain briefly and conclude with: [CONTRADICTION], [SUPPORT], or [INDEPENDENT].
"""
        response = self.ask_llm(prompt)
        
        rel_type = "independent"
        if "[CONTRADICTION]" in response: rel_type = "contradicts"
        elif "[SUPPORT]" in response: rel_type = "supports"
        
        return {"type": rel_type, "reason": response}

    def node_score(self, paper: dict) -> float:
        """Calculate a raw credibility score for a single node based on metrics and metadata."""
        meta = paper.get("metadata", {})
        
        # Simple quantitative score
        citations = meta.get("citationCount", 0)
        refs = meta.get("referenceCount", 0)
        year = meta.get("year", 2020)
        
        # Normalized score components
        cit_score = min(1.0, citations / 100) * 0.5
        ref_score = min(1.0, refs / 50) * 0.2
        recency_score = min(1.0, (year - 2010) / 15) * 0.1
        
        # AI Qualitative Score (reusing calculate_credibility logic or just the result)
        qual_score = paper.get("metadata", {}).get("credibility", 0.5) * 0.2
        
        return (cit_score + ref_score + recency_score + qual_score) * 10 # Scale to 0-10

    def cluster_score(self, cluster_nodes: list) -> float:
        """Compute the aggregate strength of a research field (cluster)."""
        if not cluster_nodes:
            return 0.0
        scores = [self.node_score(n) for n in cluster_nodes]
        return sum(scores) / len(scores)

    def detect_weak_fields(self, clusters: dict) -> list:
        """Identify thematic areas that lack rigor or evidence."""
        # clusters: { "cluster_name": [nodes] }
        weak_fields = []
        for name, nodes in clusters.items():
            score = self.cluster_score(nodes)
            if score < 4.0: # Threshold for 'weak'
                weak_fields.append({
                    "field": name,
                    "score": score,
                    "count": len(nodes),
                    "health": self.analyze_field_health(name, nodes)
                })
        return weak_fields

    def analyze_field_health(self, field_name: str, nodes: list) -> str:
        """Generate an AI interpretation of why a research field is weak or emerging."""
        context = "\n".join([f"- {n['title']} (Credibility: {self.node_score(n):.1f})" for n in nodes[:5]])
        
        prompt = f"""
Analyze this research field: '{field_name}'

Recent context:
{context}

Is this field currently:
- Underdeveloped (lacking core papers/citations)
- Inconsistent (contradictory findings/methods)
- Lacking Evidence (theoretical but not validated)
- Emerging (strong but early stage)

Explain why in 2-3 sentences.
"""
        return self.ask_llm(prompt, "You are a strategic research strategist.")
