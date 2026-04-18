from .base import BaseAgent

class GovernanceAgent(BaseAgent):
    """The AI CTO responsible for high-level decision making and research pruning."""
    
    def __init__(self, experience_store=None):
        super().__init__(experience_store=experience_store)

    def cto_review(self, research_output: str, mission_type: str = "industrial") -> dict:
        """Evaluates research output to decide whether to Continue, Pivot, or Kill."""
        self.log(f"AI CTO performing critical review of {mission_type} branch...")
        
        prompt = f"""
You are the AI CTO of a world-class research lab.

EVALUATE THIS RESEARCH OUTPUT:
{research_output[:4000]}

CRITERIA:
1. Novelty (Is this just a replicate?)
2. Technical Rigor (Are the claims grounded?)
3. Industrial Value (Can this be a product/patent?)

DECISION:
- VERDICT: [CONTINUE | PIVOT | KILL]
- REASONING: (3-4 sentences)
- ACTION: (Next strategic step)
"""
        response = self.ask_llm(prompt, "You are a critical, industry-hardened CTO.")
        
        # Simple parsing logic
        verdict = "CONTINUE"
        if "KILL" in response.upper():
            verdict = "KILL"
        elif "PIVOT" in response.upper():
            verdict = "PIVOT"
            
        self.log(f"CTO VERDICT: {verdict}", "success" if verdict == "CONTINUE" else "warning")
        
        return {
            "verdict": verdict,
            "reasoning": response,
            "agent": "AI CTO"
        }

    def evaluate_novelty(self, idea: str, baseline_papers: list) -> float:
        """Score the novelty of an idea against existing literature (0.0 - 1.0)."""
        context = "\n".join([f"- {p['title']}" for p in baseline_papers])
        prompt = f"""
Rate the novelty of this idea on a scale of 0.0 to 1.0.

IDEA: {idea}
BASELINE LITERATURE:
{context}

Return only the float number.
"""
        try:
            score = float(self.ask_llm(prompt, "You are a rigorous novelty auditor."))
            return score
        except:
            return 0.5
