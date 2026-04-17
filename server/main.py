import os
import json
import subprocess
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import lancedb
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RESEARCHAI Backend")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
STORAGE_PATH = os.path.join(os.getcwd(), "..", "nodes")
DB_PATH = os.path.join(os.getcwd(), "..", "lancedb")

# Ensure directories exist
os.makedirs(STORAGE_PATH, exist_ok=True)

class Node(BaseModel):
    id: str
    type: str # paper, concept, note, author
    title: str
    content: str
    metadata: dict = {}

class Query(BaseModel):
    text: str

@app.on_event("startup")
async def startup_db_client():
    app.state.db = lancedb.connect(DB_PATH)
    if "nodes" not in app.state.db.table_names():
        # Initialize small empty table with schema
        data = pd.DataFrame([{
            "id": "init",
            "vector": [0.0] * 384, # Assumes 384 dim embeddings
            "title": "init",
            "content": "init",
            "metadata": "{}"
        }])
        app.state.db.create_table("nodes", data=data)

def git_commit(message: str):
    try:
        subprocess.run(["git", "add", "."], cwd=os.path.join(os.getcwd(), ".."), check=True)
        subprocess.run(["git", "commit", "-m", message], cwd=os.path.join(os.getcwd(), ".."), check=True)
    except Exception as e:
        print(f"Git commit failed: {e}")

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/nodes/create")
async def create_node(node: Node):
    # 1. Save as Markdown
    file_path = os.path.join(STORAGE_PATH, f"{node.id}.md")
    with open(file_path, "w") as f:
        f.write(f"# {node.title}\n\n{node.content}\n\n---\nMetadata: {json.dumps(node.metadata)}")
    
    # 2. Trigger Git Commit (Auto-save)
    git_commit(f"Memory Agent: Created Node {node.id} - {node.title}")
    
    return {"status": "success", "id": node.id}

@app.get("/nodes")
async def list_nodes():
    nodes = []
    for filename in os.listdir(STORAGE_PATH):
        if filename.endswith(".md"):
            nodes.append(filename.replace(".md", ""))
    return {"nodes": nodes}

@app.post("/search")
async def search(query: Query):
    # Placeholder for vector search
    # In full impl, we'd use sentence-transformers to embed query.text
    return {"results": []}

from agents.researcher import ResearcherAgent, ConnectorAgent

# Agents
researcher = ResearcherAgent(STORAGE_PATH)
connector = ConnectorAgent()

class AgentQuery(BaseModel):
    query: str

@app.post("/agent/research")
async def agent_research(payload: AgentQuery):
    # 1. Search for papers using the Researcher Agent
    search_results = researcher.search_arxiv(payload.query, max_results=3)
    
    nodes = []
    links = []
    
    for paper in search_results:
        node_data = researcher.ingest_paper(paper)
        node_obj = Node(**node_data)
        await create_node(node_obj)
        nodes.append(node_data)
        
    return {
        "nodes": nodes,
        "links": links, # Citation links would be added here in following iterations
        "summary": f"Identified {len(nodes)} papers related to your query on ArXiv."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
