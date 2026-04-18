from .base import BaseAgent
import re

class AdvisorAgent(BaseAgent):
    """A ruthless PhD Advisor agent that audits research for logical flaws, novelty, and rigor."""
    
    def __init__(self, experience_store=None):
        super().__init__(experience_store=experience_store)

    def audit_research(self, content: str) -> dict:
        """Performed critical PhD-level audit of the research output."""
        self.log("Commencing PhD Advisor audit protocol...")
        
        prompt = f"""
You are a strict PhD advisor reviewing a research output. Assume the work is flawed unless proven otherwise.

RESEARCH CONTENT:
{content[:5000]}

EVALUATE:
1. Literature Quality: Are sources top-tier? Are key papers missing?
2. Research Idea Validity: Is it novel or just recombination?
3. Technical Soundness: Any logical gaps or invalid assumptions?
4. Evidence: Are claims backed by citations or experiments?
5. Fatal Flaws: Why would this work be rejected?

RETURN:
- SCORE: [X/10]
- DECISION: [ACCEPT | REVISE | REJECT]
- CRITICAL_ISSUES: (Bulleted list)
- REQUIRED_FIXES: (Step-by-step instructions)
"""
        response = self.ask_llm(prompt, "You are a ruthless, skeptical PhD Advisor.")
        
        # Parse score and decision
        score_match = re.search(r'(\d+)/10', response)
        score = int(score_match.group(1)) if score_match else 5
        
        decision = "REVISE"
        if "REJECT" in response.upper(): decision = "REJECT"
        elif "ACCEPT" in response.upper(): decision = "ACCEPT"
        
        self.log(f"Audit Complete. Score: {score}/10. Decision: {decision}", "warning" if decision != "ACCEPT" else "success")
        
        return {
            "score": score,
            "decision": decision,
            "audit": response,
            "agent": "PhD Advisor"
        }

    def refine_instructions(self, original_draft: str, audit: str) -> str:
        """Generate specific refinement instructions to fix the issues identified in the audit."""
        prompt = f"""
Improve this research based on the PhD Advisor audit.

ORIGINAL WORK:
{original_draft[:3000]}

ADVISOR AUDIT:
{audit}

Generate a REFINED version that addresses ALL critical issues and required fixes.
Maintain academic rigor and evidence-driven reasoning.
"""
        return self.ask_llm(prompt, "You are a meticulous research refiner.")
