import os
import arxiv
from semanticscholar import SemanticScholar
from PyPDF2 import PdfReader
from typing import List, Optional

class ResearcherAgent:
    """Agent responsible for fetching and parsing research papers."""
    
    def __init__(self, node_storage_path: str):
        self.storage_path = node_storage_path
        self.sch = SemanticScholar()

    def search_arxiv(self, query: str, max_results: int = 5):
        """Search ArXiv for papers."""
        client = arxiv.Client()
        search = arxiv.Search(query=query, max_results=max_results, sort_by=arxiv.SortCriterion.Relevance)
        results = []
        for result in client.results(search):
            results.append({
                "id": f"arxiv_{result.entry_id.split('/')[-1]}",
                "title": result.title,
                "summary": result.summary,
                "authors": [a.name for a in result.authors],
                "pdf_url": result.pdf_url,
                "source": "arxiv"
            })
        return results

    def fetch_citations(self, paper_id: str):
        """Fetch references and citations for a paper via Semantic Scholar."""
        try:
            # Note: Semantic scholar often needs DOI or specific ID
            paper = self.sch.get_paper(paper_id)
            return {
                "references": paper.references[:5] if paper.references else [],
                "citations": paper.citations[:5] if paper.citations else []
            }
        except Exception:
            return {"references": [], "citations": []}

    def parse_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        text = ""
        try:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                text += page.extract_text()
        except Exception as e:
            print(f"Error parsing PDF: {e}")
        return text

    def ingest_paper(self, paper_data: dict):
        """Process a paper and create a concept node."""
        return {
            "id": paper_data["id"],
            "title": paper_data["title"],
            "content": paper_data.get("summary", ""),
            "type": "paper",
            "metadata": {
                "source": paper_data.get("source", "unknown"),
                "authors": paper_data.get("authors", []),
                "pdf_url": paper_data.get("pdf_url", "")
            }
        }

class ConnectorAgent:
    """Agent responsible for inferring links between knowledge nodes."""
    
    def find_links(self, target_node: dict, all_nodes: List[dict]):
        """Simple keyword-based linking for now. Would use embeddings in SOTA."""
        links = []
        target_content = target_node.get("content", "").lower()
        
        for node in all_nodes:
            if node["id"] == target_node["id"]:
                continue
            if node["title"].lower() in target_content:
                links.append(node["id"])
        
        return links
