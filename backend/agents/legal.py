from .base import BaseAgent
from datetime import datetime

class LegalAgent(BaseAgent):
    """Agent responsible for IP protection, Patents, and Grant writing."""
    
    def generate_patent(self, idea_content: str) -> str:
        """Drafts a formal patent application based on a research idea."""
        self.log("Drafting Patent Application...")
        
        prompt = f"""
Write a formal patent draft based on this research idea:

{idea_content}

STRUCTURE:
1. Title
2. Field of the Invention
3. Background
4. Summary
5. Detailed Description (The 'How-To')
6. CLAIMS (Must include at least one independent and two dependent claims)

Ensure the language is broad, defensible, and legally precise.
"""
        patent = self.ask_llm(prompt, "You are a specialized Patent Attorney with an engineering background.")
        self.reflect("Patent Drafting", idea_content[:500], 0.9)
        return patent

    def generate_grant(self, idea_content: str, target_funding_body: str = "National Science Foundation") -> str:
        """Generates a compelling research grant proposal."""
        self.log(f"Generating Grant Proposal for {target_funding_body}...")
        
        prompt = f"""
Write a research grant proposal for: {target_funding_body}

RESEARCH IDEA:
{idea_content}

INCLUDE:
1. Significance (Why this matters)
2. Innovation (What is new)
3. Approach (Methodology)
4. Broader Impacts (Social/Economic benefits)
5. Timeline & Milestones

Tone: Persuasive, rigorous, and visionary.
"""
        grant = self.ask_llm(prompt, "You are a professional Grant Writer with a 90% success rate.")
        self.reflect("Grant Generation", f"Funding body: {target_funding_body}", 0.85)
        return grant

    def estimate_budget(self, duration_months: int = 12) -> dict:
        """Estimates a realistic research budget based on duration."""
        return {
            "personnel": f"${15000 * duration_months}",
            "compute_credits": "$25,000",
            "data_acquisition": "$10,000",
            "equipment": "$15,000",
            "total_estimated": f"${(15000 * duration_months) + 50000}"
        }
