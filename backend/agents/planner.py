from .base import BaseAgent
import json

SOTA_TEMPLATE = """
Title: [Draft Title]

Research Idea:
(Derived from literature review and gap analysis)

Literature Review:
- Grounding Pattern A: [Summary of core papers]
- Grounding Pattern B: [Summary of related papers]
- Gap Identified: [The specific missing piece or contradiction]

Motivation:
I want to explore XXX inspired by AAA/BBB.
This is important because [Significance].
This is challenging because [Difficulty/Obstacles].

Novelties:
Our approach differs by:
- [Novelty A: e.g., introducing a new layer]
- [Novelty B: e.g., applying a technique from a different field]

Advantages:
This improves:
- Performance because [Reasoning]
- Efficiency because [Reasoning]
- Robustness/Privacy because [Reasoning]

Methodology:
- Model/System Design: [High-level architecture]
- Pipeline: [Step-by-step execution]
- Assumptions: [What we take for granted]

Feasibility:
- Dataset: [Available datasets or collection strategy]
- Tools: [Frameworks and hardware]
- Metrics: [How success is measured]

Expected Results:
[Predicted outcome and why it is likely]

Potential Risks:
- [Limitation A]
- [Failure Mode B]

Citations:
[Formatted references with IDs]
"""

class PlannerAgent(BaseAgent):
    """Agent responsible for breaking down a query into research steps."""
    
    def generate_proposal(self, query: str, papers: list) -> str:
        """Generates a high-quality research proposal following the SOTA template."""
        self.log(f"Generating formal research proposal for: {query}")
        
        context = "\n\n".join([
            f"ID: {p['id']}\nTitle: {p['title']}\nClaims: {p.get('metadata', {}).get('structure', {}).get('claims', [])}\nSummary: {p['content'][:800]}"
            for p in papers
        ])
        
        prompt = f"""
Generate a structured research proposal STRICTLY following this Master Template:

{SOTA_TEMPLATE}

User Query/Topic: {query}
Literature Context:
{context}

Ensure all sections are complete, rigorous, and logically connected to the provided literature.
"""
        proposal = self.ask_llm(prompt, "You are a Lead Research Scientist at a top-tier lab.")
        self.reflect("Proposal Generation", proposal[:500], 0.9)
        return proposal

    def plan_research(self, query: str, memory_context: str = "") -> dict:
        self.log(f"Planning research for: {query}")
        
        system_prompt = """
You are a Lead Research Planner. Break the user's query into a structured multi-step plan.
Actions available: 
- SEARCH: Look for new papers on ArXiv/S2.
- EXPAND: Find citations for a specific paper.
- CRITICIZE: Evaluate a paper's credibility and claims.
- CONNECT: Find semantic bridges between two papers.

Return a JSON-formatted plan list.
Example: [{"step": 1, "action": "SEARCH", "target": "transformer efficiency"}]
"""
        
        prompt = f"User Query: {query}\nRecent Memory: {memory_context}"
        
        # Apply Meta-Cognition (Past Successes)
        prompt = self.apply_experience(prompt)
        
        raw_plan = self.ask_llm(prompt, system_prompt)
        
        # Simple extraction if LLM provides text around JSON
        try:
            # Look for JSON array in the response
            start = raw_plan.find("[")
            end = raw_plan.rfind("]") + 1
            if start != -1 and end != -1:
                final_plan = json.loads(raw_plan[start:end])
                self.reflect(f"Planning for {query}", raw_plan, 0.9) # Successful parsing
                return final_plan
        except Exception as e:
            self.log(f"Plan parsing failed: {e}", "error")
            self.reflect(f"Planning for {query}", raw_plan, 0.1) # Failed parsing
            
        # Default safety plan
        return [{"step": 1, "action": "SEARCH", "target": query}]
