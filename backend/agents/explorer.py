import os
import arxiv
import json
import time
from semanticscholar import SemanticScholar
from sentence_transformers import SentenceTransformer
from .base import BaseAgent
from typing import List

# Shared embedding model
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

class ExplorerAgent(BaseAgent):
    """Agent responsible for paper search and raw ingestion."""
    
    def __init__(self, storage_path: str, experience_store=None):
        super().__init__(experience_store=experience_store)
        self.storage_path = storage_path
        self.sch = SemanticScholar()

    def extract_structure(self, abstract: str) -> dict:
        """High-fidelity structural parsing for RESEARCHAI cognitive mapping."""
        prompt = f"""
As a RESEARCHAI Principal Investigator, analyze this abstract and extract its cognitive architecture.

RESEARCH ARTIFACT:
{abstract}

EXTRACT:
1. Core Semantic Claims (What is fundamentally proposed?)
2. Methodological Rigor (Approaches / Tools used)
3. Foundational Assumptions (What is taken for granted?)

Return a JSON object: {"claims": [], "methods": [], "assumptions": []}.
Ensure the depth is suitable for a PhD-level literature review.
"""
        raw_json = self.ask_llm(prompt, "You are a RESEARCHAI Principal Investigator.")
        try:
            start = raw_json.find("{")
            end = raw_json.rfind("}") + 1
            if start != -1 and end != -1:
                structure = json.loads(raw_json[start:end])
                self.reflect("Sovereign Structural Extraction", abstract[:100], 0.9)
                return structure
        except Exception as e:
            self.log(f"Structural parsing failed: {e}", "warning")
            self.reflect("Sovereign Structural Extraction", abstract[:100], 0.2)
            
        return {"claims": [], "methods": [], "assumptions": []}

    def ingest(self, paper_data: dict) -> dict:
        """Create structured metadata for a paper with deep structural analysis."""
        summary = paper_data.get('summary', '') or paper_data.get('content', '')
        structure = self.extract_structure(summary)
        
        text = f"{paper_data['title']} {summary}"
        embedding = embed_model.encode(text).tolist()
        
        return {
            "id": paper_data["id"],
            "title": paper_data["title"],
            "content": summary,
            "type": "paper",
            "metadata": {
                "source": paper_data.get("source", "arxiv"),
                "authors": paper_data.get("authors", []),
                "embedding": embedding,
                "ingested_at": time.time(),
                "structure": structure
            }
        }

    def is_high_quality_venue(self, venue: str) -> bool:
        """Verify if the paper venue matches PhD-level rigor (A*, IEEE, ACM, Nature, Science)."""
        if not venue:
            return False
            
        rigor_keywords = ["IEEE", "ACM", "Nature", "Science", "ICLR", "NeurIPS", "CVPR", "ICCV", "SIGGRAPH", "AAAI", "IJCAI"]
        v_upper = venue.upper()
        
        # Check for CORE A* or Top Journals
        return any(k in v_upper for k in rigor_keywords) or "TRANSACTIONS" in v_upper or "JOURNAL" in v_upper

    def search(self, query: str, limit: int = 10) -> List[dict]:
        """Search ArXiv and Semantic Scholar for HIGH RIGOR papers matching the query."""
        self.log(f"Searching for high-rigor sources: {query} (A* / Journal Filter ACTIVE)")
        
        # 1. Semantic Scholar Search (Advanced metadata)
        results = []
        try:
            s2_results = self.sch.search_paper(query, limit=limit, fields=["title", "abstract", "year", "venue", "citationCount", "externalIds"])
            
            for p in s2_results:
                # ENFORCE RIGOR: Citation Count > 50 or Top Venue or Recent (2024+)
                is_rigorous = p.citationCount >= 50 or self.is_high_quality_venue(p.venue) or p.year >= 2024
                
                if is_rigorous:
                    results.append({
                        "id": f"s2_{p.paperId}",
                        "title": p.title,
                        "summary": p.abstract or "",
                        "year": p.year,
                        "venue": p.venue,
                        "citationCount": p.citationCount,
                        "source": "semanticscholar"
                    })
                else:
                    self.log(f"Filtered low-rigor source: {p.title} (Cit: {p.citationCount}, Venue: {p.venue})", "warning")
                    
        except Exception as e:
            self.log(f"High-Rigor Search Error: {e}", "error")
            
        return results[:5] # Return top 5 rigorous matches

    def fetch_lineage(self, paper_id: str) -> dict:
        """Fetch references to expand the graph."""
        try:
            s2_id = paper_id.replace("arxiv_", "ARXIV:")
            paper = self.sch.get_paper(s2_id)
            refs = []
            if paper.references:
                for ref in paper.references[:8]:
                    refs.append({
                        "paperId": ref.paperId,
                        "title": ref.title,
                        "authors": [a.name for a in ref.authors] if ref.authors else [],
                        "citationCount": getattr(ref, 'citationCount', 0)
                    })
            return {"references": refs}
        except Exception as e:
            self.log(f"S2 Lineage Error: {e}", "warning")
            return {"references": []}
