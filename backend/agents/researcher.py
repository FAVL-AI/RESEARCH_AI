import os
import arxiv
import numpy as np
from semanticscholar import SemanticScholar
from PyPDF2 import PdfReader
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from agents.base import BaseAgent

# Initialize the embedding model (384-dim, lightweight SOTA)
model = SentenceTransformer('all-MiniLM-L6-v2')

class ResearcherAgent(BaseAgent):
    """Agent responsible for fetching and parsing research papers."""
    
    def __init__(self, node_storage_path: str):
        super().__init__()
        self.storage_path = node_storage_path
        self.sch = SemanticScholar()

    def embed(self, text: str) -> List[float]:
        """Generate a semantic embedding for a string."""
        if not text:
            return [0.0] * 384
        return model.encode(text).tolist()

    def cluster_nodes(self, nodes: List[dict], n_clusters: int = 3) -> List[dict]:
        """Group nodes into clusters based on their semantic content."""
        if len(nodes) < n_clusters:
            for node in nodes:
                node["cluster"] = 0
            return nodes

        # 1. Generate embeddings for all node titles/abstracts
        texts = [f"{n['title']} {n.get('content', '')}" for n in nodes]
        embeddings = model.encode(texts)

        # 2. Run KMeans
        kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
        clusters = kmeans.fit_predict(embeddings)

        # 3. Assign cluster ID to each node
        for i, node in enumerate(nodes):
            node["cluster"] = int(clusters[i])
        
        return nodes

    def search_arxiv(self, query: str, max_results: int = 5):
        """Search ArXiv for papers. Supports both keywords and specific IDs."""
        client = arxiv.Client()
        
        # Check if query looks like an ArXiv ID (e.g., 2101.12345 or 0309395)
        # Old IDs can be like cond-mat/0309395, new ones are YYMM.NNNNN
        is_id = any(c.isdigit() for c in query) and ('.' in query or len(query) >= 7)
        
        if is_id:
            search = arxiv.Search(id_list=[query], max_results=1)
        else:
            search = arxiv.Search(query=query, max_results=max_results, sort_by=arxiv.SortCriterion.Relevance)
            
        results = []
        try:
            for result in client.results(search):
                results.append({
                    "id": f"arxiv_{result.entry_id.split('/')[-1]}",
                    "title": result.title,
                    "summary": result.summary,
                    "authors": [a.name for a in result.authors],
                    "pdf_url": result.pdf_url,
                    "source": "arxiv"
                })
        except Exception as e:
            print(f"ArXiv API Error: {e}")
            
        return results

    def fetch_citations(self, paper_id: str):
        """Fetch references and citations for a paper via Semantic Scholar."""
        try:
            s2_id = paper_id.replace("arxiv_", "ARXIV:")
            paper = self.sch.get_paper(s2_id)
            
            references = []
            if paper.references:
                for ref in paper.references[:8]:
                    references.append({
                        "paperId": ref.paperId,
                        "title": ref.title,
                        "authors": [{"name": a.name} for a in ref.authors] if ref.authors else [],
                        "citationCount": ref.get('citationCount', 0)
                    })
            
            return {
                "references": references,
                "citations": [],
                "influence_score": (paper.citationCount * 2) + paper.referenceCount if paper else 0
            }
        except Exception as e:
            print(f"S2 Fetch Error: {e}")
            return {"references": [], "citations": [], "influence_score": 0}

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
        """Process a paper and create a concept node with embeddings."""
        # Extract core claims using a simple heuristic (first 2 sentences) or pass to Gemma later
        content = paper_data.get("summary", "")
        embedding = self.embed(paper_data["title"] + " " + content)
        
        return {
            "id": paper_data["id"],
            "title": paper_data["title"],
            "content": content,
            "type": "paper",
            "metadata": {
                "source": paper_data.get("source", "unknown"),
                "authors": paper_data.get("authors", []),
                "pdf_url": paper_data.get("pdf_url", ""),
                "embedding": embedding,
                "claims": content[:500] # Distilled claims placeholder
            }
        }

    def search_github(self, query: str):
        """Search GitHub for repositories matching the paper's title or key concepts."""
        try:
            url = "https://api.github.com/search/repositories"
            params = {"q": query, "sort": "stars", "order": "desc", "per_page": 3}
            r = requests.get(url, params=params, timeout=10)
            return r.json().get("items", [])
        except Exception as e:
            print(f"GitHub Search Error: {e}")
            return []

    def find_gaps(self, nodes: List[dict], links: List[dict]):
        """Identify sparse connections between semantically related clusters."""
        connected_pairs = set()
        for link in links:
            connected_pairs.add(tuple(sorted([link["source"], link["target"]])))
        
        gaps = []
        # Look for nodes in the same cluster that aren't linked
        for i, n1 in enumerate(nodes):
            for j, n2 in enumerate(nodes):
                if i >= j: continue
                if n1.get("cluster") == n2.get("cluster") and n1.get("cluster") is not None:
                    pair = tuple(sorted([n1["id"], n2["id"]]))
                    if pair not in connected_pairs:
                        gaps.append((n1, n2))
        
        return gaps[:5] # Return top 5 potential gaps

    def recommend_next(self, current_node: dict, all_nodes: List[dict]):
        """Rank nodes for 'What to read next' using hybrid relevance."""
        recommendations = []
        target_emb = current_node.get("metadata", {}).get("embedding")
        if not target_emb: return []

        target_emb = np.array(target_emb)

        for node in all_nodes:
            if node["id"] == current_node["id"]: continue
            
            node_emb = node.get("metadata", {}).get("embedding")
            if not node_emb: continue
            
            node_emb = np.array(node_emb)
            similarity = np.dot(target_emb, node_emb) / (np.linalg.norm(target_emb) * np.linalg.norm(node_emb))
            
            # Hybrid score: 60% similarity, 40% influence
            score = (similarity * 0.6) + (node.get("metadata", {}).get("score", 0) * 0.4)
            recommendations.append({"node": node, "score": float(score)})
        
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return [r["node"] for r in recommendations[:5]]

class ResearchAgent:
    """Stateful agent representing a continuously learning research partner."""
    def __init__(self, memory_path: str):
        self.memory_path = memory_path
        self.conversation_history = []

    def run_step(self, query: str, context_nodes: List[dict]):
        # 1. Recall memory from recent context
        context_str = "\n".join([f"{n['title']}: {n['content'][:200]}" for n in context_nodes[:3]])
        history_str = "\n".join(self.conversation_history[-3:])
        
        prompt = f"""
Current Research Context:
{context_str}

Conversation History:
{history_str}

User Query: {query}

Plan the next research steps (search, expand, analyze).
Return a reasoning block followed by the proposed ACTION.
"""
        # Note: This would call ask_gemma in the main loop
        return prompt # Returning prompt for orchestrator to handle

    def refine_memory(self, insights: List[dict]):
        """Consolidate multiple insights into a clearer, higher-level summary."""
        context = "\n\n".join([f"Insight: {i['content']}" for i in insights])
        prompt = f"Refine these disparate research insights into a single, cohesive synthesis:\n\n{context}"
        return prompt

class ConnectorAgent:
    """Agent responsible for inferring semantic links between knowledge nodes."""
    
    def find_links(self, target_node: dict, all_nodes: List[dict], threshold: float = 0.75):
        """Identify semantic links using cosine similarity of embeddings."""
        links = []
        target_emb = target_node.get("metadata", {}).get("embedding")
        
        if not target_emb:
            return []

        target_emb = np.array(target_emb)
        
        for node in all_nodes:
            if node["id"] == target_node["id"]:
                continue
            
            node_emb = node.get("metadata", {}).get("embedding")
            if not node_emb:
                continue
            
            node_emb = np.array(node_emb)
            
            # Cosine similarity
            similarity = np.dot(target_emb, node_emb) / (np.linalg.norm(target_emb) * np.linalg.norm(node_emb))
            
            if similarity > threshold:
                links.append({"target": node["id"], "similarity": float(similarity)})
        
        return links
