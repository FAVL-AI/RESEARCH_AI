from .base import BaseAgent

class StartupAgent(BaseAgent):
    """Agent responsible for converting research into viable products and startups."""

    def research_to_product(self, idea_content: str) -> str:
        """Translates abstract research into a marketable product concept."""
        self.log("Synthesizing Startup Concept...")
        
        prompt = f"""
Convert this research idea into a startup pitch:

{idea_content}

OUTPUT:
1. Product Name
2. Target Users (Who pays?)
3. Problem Solved (Pain points)
4. Unique Advantage (Why you?)
5. GTM Strategy (How to reach them)
"""
        product = self.ask_llm(prompt, "You are a serial entrepreneur and Y-Combinator partner.")
        self.reflect("Product Synthesis", idea_content[:500], 0.9)
        return product

    def generate_mvp_spec(self, product_concept: str) -> str:
        """Drafts a technical specification for a Minimum Viable Product."""
        self.log("Drafting MVP Technical Specification...")
        
        prompt = f"""
Draft an MVP Technical Spec for:
{product_concept}

INCLUDE:
1. Core Features (The 'Must-Haves')
2. Proposed Tech Stack
3. Architecture Overview
4. Week-by-Week Implementation Plan (4 Weeks)
"""
        spec = self.ask_llm(prompt, "You are a CTO specializing in rapid prototyping.")
        return spec

    def simulate_feedback(self, product_concept: str, persona: str = "Enterprise VC") -> str:
        """Simulates adversarial feedback from a specific market persona."""
        self.log(f"Simulating feedback from: {persona}")
        
        prompt = f"""
Take the role of: {persona}

Critique this product concept:
{product_concept}

BE CRITICAL. Identify:
1. Market risks
2. Adoption friction
3. Competitive threats
4. Missing features
"""
        feedback = self.ask_llm(prompt, f"You are a critical {persona} looking for reasons to say no.")
        self.reflect("Market Feedback Simulation", persona, 0.95)
        return feedback
