import sys
import os
import json
import subprocess
from datetime import datetime
from typing import List, Optional
import pandas as pd
from fastapi import FastAPI, HTTPException, Body, WebSocket, WebSocketDisconnect, UploadFile, File
import lancedb
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager
from pydantic import BaseModel

# --- INFRASTRUCTURE SETUP ---
# Ensure backend directory is in path for local imports
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from state import StateManager

from state import StateManager

# --- CONFIGURATION ---
STORAGE_PATH = os.getenv("STORAGE_PATH", "./research_data")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Primary state manager (hardened for Redis connection failures)
state_manager = StateManager(REDIS_URL)

try:
    from rq import Queue
    task_queue = Queue(connection=state_manager.client if state_manager.connected else None)
except:
    task_queue = None

# WebSocket Connection Manager (Upgraded for Redis Pub/Sub)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Initial hydration with robust error handling
        try:
            state = state_manager.get_full_state()
            if state:
                await websocket.send_json({"type": "sync", "data": state})
                print(f"[*] WebSocket Sync sent to client.")
        except Exception as e:
            print(f"[!] WebSocket Sync skipped or failed: {e}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

    async def redis_listener(self):
        """Listens to Redis events and broadcasts them to all connected WebSockets."""
        if not state_manager.connected:
            print("[!] Skipping Redis listener (Safe Mode)")
            return

        pubsub = state_manager.client.pubsub()
        pubsub.subscribe(f"{state_manager.namespace}:events")
        while True:
            try:
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    data = json.loads(message['data'])
                    await self.broadcast(data)
            except:
                pass
            await asyncio.sleep(0.1)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and listener
    os.makedirs(DB_PATH, exist_ok=True)
    app.state.db = lancedb.connect(DB_PATH)
    try:
        if "nodes" not in app.state.db.list_tables():
            # Initialize small empty table with schema
            data = pd.DataFrame([{
                "id": "init",
                "vector": [0.0] * 384, # Assumes 384 dim embeddings
                "title": "init",
                "content": "init",
                "metadata": "{}"
            }])
            app.state.db.create_table("nodes", data=data)
    except Exception as e:
        print(f"[*] Table 'nodes' already exists or other DB init error (non-fatal): {e}")
    
    # Start Redis listener
    listener_task = asyncio.create_task(manager.redis_listener())
    yield
    # Shutdown
    listener_task.cancel()

app = FastAPI(title="RESEARCHAI Backend", lifespan=lifespan)


# Add the parent directory (backend/) to sys.path to allow importing from other modules
# (Already handled at the top, but keeping reference for safety)
from agents.researcher import ResearcherAgent
from agents.swarm import SwarmController
from agents.governance import GovernanceAgent
from agents.studio import PodcastAgent, DeckAgent, SMEAgent
from api.mission import MissionController, MissionState
from research import DOIResolver, CitationGenerator, ResearchExporter
from services.source_manager import SourceManager

# Enable Absolute CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.middleware("http")
async def add_resilient_cors_headers(request, call_next):
    """Low-level middle-ware to ensure headers exist even if the cycle is interrupted."""
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Configuration
# Path resolution for the new structure: backend/api/main.py -> RESEARCHAI root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STORAGE_PATH = os.path.join(BASE_DIR, "data", "memory")
DB_PATH = os.path.join(BASE_DIR, "data", "lancedb")

# Subdirectory map
SUBDIRS = ["papers", "concepts", "sessions", "insights", "uploads"]

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Fallback handler to ensure CORS headers exist even on absolute crash."""
    from fastapi.responses import JSONResponse
    content = {"message": str(exc), "type": "INTERNAL_OS_CRASH", "status": "error"}
    return JSONResponse(
        status_code=500,
        content=content,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

# Ensure directories exist
for sd in SUBDIRS:
    os.makedirs(os.path.join(STORAGE_PATH, sd), exist_ok=True)

def resolve_path(node_id: str, node_type: str = None) -> str:
    """Helper to find or provide path for a node based on type."""
    if node_type == "paper" or node_id.startswith("arxiv_") or node_id.startswith("s2_"):
        return os.path.join(STORAGE_PATH, "papers", f"{node_id}.md")
    if node_type == "concept":
        return os.path.join(STORAGE_PATH, "concepts", f"{node_id}.md")
    if node_type == "session":
        return os.path.join(STORAGE_PATH, "sessions", f"{node_id}.md")
    
    # Search all if not specified
    for sd in SUBDIRS:
        path = os.path.join(STORAGE_PATH, sd, f"{node_id}.md")
        if os.path.exists(path):
            return path
            
    # Check absolute root memory storage
    root_path = os.path.join(STORAGE_PATH, f"{node_id}.md")
    if os.path.exists(root_path):
        return root_path
            
    # Default to papers for ingestion
    return os.path.join(STORAGE_PATH, "papers", f"{node_id}.md")

class Node(BaseModel):
    id: str
    type: str # paper, concept, note, author
    title: str
    content: str
    metadata: dict = {}

class NodeIdPayload(BaseModel):
    id: str

class Query(BaseModel):
    text: str

class MissionStartPayload(BaseModel):
    goal: str
    duration_hours: int
    constraints: List[str] = []

class AgentQuery(BaseModel):
    query: str

class DecisionPayload(BaseModel):
    decision: str  # approve, reject, revise
    notes: str = ""

@app.post("/api/mission/{mission_id}/supervise")
async def supervise_mission(mission_id: str, payload: DecisionPayload):
    """Submits a human supervisor decision to a pending mission checkpoint."""
    # Store decision in Redis for the worker to pick up
    if state_manager.connected:
        decision_key = f"mission:{mission_id}:decision"
        state_manager.client.set(decision_key, json.dumps({
            "decision": payload.decision.lower(),
            "notes": payload.notes,
            "timestamp": datetime.now().isoformat()
        }))
    
    # Broadcast to update UI
    await manager.broadcast({
        "type": "supervisor_action",
        "mission_id": mission_id,
        "decision": payload.decision
    })
    
    return {"status": "recorded", "decision": payload.decision}

@app.get("/api/mission/{mission_id}/pending")
async def check_pending_decision(mission_id: str):
    """Checks if a mission is waiting for human input."""
    decision_key = f"mission:{mission_id}:decision"
    pending_key = f"mission:{mission_id}:pending"
    
    if not state_manager.connected:
        return {"is_pending": False, "last_decision": None}

    return {
        "is_pending": state_manager.client.exists(pending_key),
        "last_decision": json.loads(state_manager.client.get(decision_key)) if state_manager.client.exists(decision_key) else None
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection and listen for any client messages
            data = await websocket.receive_text()
            # Heartbeat or client-side command handling could go here
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[*] WebSocket connection closed with error: {e}")
        manager.disconnect(websocket)

# Initialize Studio Components
source_manager = SourceManager(STORAGE_PATH)
podcast_agent = PodcastAgent()
deck_agent = DeckAgent()
sme_agent = SMEAgent()

@app.get("/api/sources")
async def get_all_sources():
    return source_manager.get_sources()

@app.post("/api/sources/link")
async def link_source(payload: dict):
    # payload: { type: 'local' | 'github' | 'notion' | 'web' | 'cloud', ... }
    stype = payload.get("type", "local")
    name = payload.get("name", "Unnamed Source")
    
    if stype == "local":
        return {"id": source_manager.add_local_source(payload.get("path", ""), name)}
    elif stype in ["github", "gitlab", "gitbucket"]:
        return {"id": source_manager.add_git_source(stype, payload.get("url", ""), payload.get("token"), name)}
    elif stype == "notion":
        return {"id": source_manager.add_notion_source(payload.get("page_id", ""), payload.get("secret"))}
    elif stype == "web":
        # Temporary stub for web search sources
        return {"id": f"web_{int(time.time())}", "status": "linked"}
    elif stype == "cloud":
        return {"id": f"cloud_{int(time.time())}", "status": "linked"}
        
    return {"id": f"gen_{int(time.time())}", "status": "accepted"}

@app.post("/api/sources/upload")
async def upload_source_file(file: UploadFile = File(...)):
    """Handles direct file uploads into the sovereign archive."""
    upload_dir = os.path.join(STORAGE_PATH, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    
    # Save file sovereignly
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    source_id = source_manager.add_uploaded_file(file_path, file.filename)
    
    return {
        "status": "success", 
        "filename": file.filename, 
        "source_id": source_id,
        "path": file_path
    }

@app.post("/api/studio/generate")
async def generate_studio_artifact(payload: dict):
    # payload: { type: 'audio' | 'slides' | 'quiz', source_ids: string[] }
    atype = payload.get("type")
    source_ids = payload.get("source_ids", [])
    
    # Retrieve content from connected sources
    source_content = []
    for sid in source_ids:
        content = source_manager.get_source_content(sid)
        if content:
            source_content.append(content)
            
    if not source_content:
        # Fallback to general topic if no sources provided
        source_content = [{"title": "General Research", "content": "Knowledge base bootstrap."}]
    
    topic = "Contextual Synthesis" # Derived from sources in a real run
    
    if atype == "audio":
        script = podcast_agent.generate_script(topic, source_content)
        return {"type": "audio", "content": script}
    elif atype == "slides":
        deck = deck_agent.generate_slides(topic, source_content)
        return {"type": "slides", "content": deck}
    elif atype == "quiz":
        cards = sme_agent.generate_flashcards(topic, source_content)
        return {"type": "quiz", "content": cards}
    elif atype == "flashcards":
        cards = sme_agent.generate_flashcards(topic, source_content) # Reuse for now
        return {"type": "flashcards", "content": cards}
    
    raise HTTPException(status_code=400, detail="Unknown artifact type")

# Update Swarm to use broadcaster
class BroadsastingSwarm(SwarmController):
    async def log(self, message: str, status: str = "info"):
        print(f"[Swarm] {message}")
        await manager.broadcast({
            "type": "agent_log",
            "message": message,
            "status": status,
            "timestamp": datetime.now().isoformat()
        })

# Initialize Swarm with broadcaster
swarm = BroadsastingSwarm(STORAGE_PATH)

# Initialize Mission Controller
mission_ctrl = MissionController(STORAGE_PATH, swarm)

# Initialize Research Tools
doi_resolver = DOIResolver()
citation_gen = CitationGenerator()
exporter = ResearchExporter(os.path.join(BASE_DIR, "data", "exports"))

# Initialize Governance Agent
governance_agent = GovernanceAgent()

# Initialize specialized agents for endpoints
from agents.researcher import ResearcherAgent, ConnectorAgent
researcher = ResearcherAgent(STORAGE_PATH)
connector = ConnectorAgent()

def ask_gemma(prompt: str, system_context: str = "Assistant"):
    """Helper to route LLM calls through the primary planner."""
    if hasattr(swarm, 'planner'):
        return swarm.planner.ask_llm(prompt, system_context)
    return "LLM Infrastructure starting up... please retry soon."

class SettingsPayload(BaseModel):
    proxy_url: str

@app.post("/api/settings/proxy")
async def update_proxy_settings(payload: SettingsPayload):
    """Updates the institutional proxy base URL."""
    doi_resolver.proxy_base = payload.proxy_url
    return {"status": "success", "proxy_url": payload.proxy_url}

@app.get("/api/settings/proxy")
async def get_proxy_settings():
    return {"proxy_url": doi_resolver.proxy_base or ""}

@app.post("/api/nodes/create")
async def create_node(node: Node):
    # 1. Save as Markdown in structured subfolder
    file_path = resolve_path(node.id, node.type)
    
    with open(file_path, "w") as f:
        f.write(f"# {node.title}\n\n{node.content}\n\n---\nMetadata: {json.dumps(node.metadata)}")
    
    # 2. Trigger Git Commit (Auto-save)
    git_commit(f"Memory Agent: Created Node {node.id} - {node.title}")
    
    return {"status": "success", "id": node.id, "path": file_path}

def git_commit(message: str):
    try:
        # Commit from project root
        subprocess.run(["git", "add", "."], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "commit", "-m", message], cwd=BASE_DIR, check=True)
    except Exception as e:
        print(f"Git commit failed: {e}")

@app.get("/api/nodes/{id}")
async def get_node(id: str):
    file_path = resolve_path(id)
    
    if not os.path.exists(file_path):
        # ON-DEMAND INGESTION
        try:
            if id.startswith("arxiv_"):
                clean_id = id.replace("arxiv_", "")
                print(f"On-demand ingestion triggered for ArXiv: {clean_id}")
                search_results = swarm.explorer.search(clean_id, limit=1)
                if search_results:
                    paper = search_results[0]
                    node_data = swarm.explorer.ingest(paper)
                    await create_node(Node(**node_data))
                    return node_data
            
            elif id.startswith("s2_"):
                clean_id = id.replace("s2_", "")
                print(f"On-demand ingestion triggered for S2: {clean_id}")
                paper_info = swarm.explorer.sch.get_paper(clean_id)
                if paper_info:
                    paper_data = {
                        "id": id,
                        "title": paper_info.title,
                        "summary": paper_info.abstract or "Abstract not available in S2.",
                        "authors": [a.name for a in paper_info.authors] if paper_info.authors else [],
                        "pdf_url": paper_info.url,
                        "source": "semanticscholar"
                    }
                    node_data = swarm.explorer.ingest(paper_data)
                    await create_node(Node(**node_data))
                    return node_data
        except Exception as e:
            print(f"On-demand ingestion failed: {e}")
            
        raise HTTPException(status_code=404, detail=f"Node {id} not found and could not be ingested on-demand.")
    
    with open(file_path, "r") as f:
        content = f.read()
    
    # Simple parser for the metadata block we added in create_node
    parts = content.split("---\nMetadata: ")
    main_body = parts[0].strip()
    metadata = {}
    if len(parts) > 1:
        try:
            metadata = json.loads(parts[1])
        except:
            pass
            
    return {
        "id": id,
        "title": main_body.split("\n")[0].replace("# ", ""),
        "content": main_body,
        "metadata": metadata
    }

@app.get("/api/nodes")
async def list_nodes():
    nodes = []
    for root, _, files in os.walk(STORAGE_PATH):
        for filename in files:
            if filename.endswith(".md"):
                nodes.append(filename.replace(".md", ""))
    return {"nodes": nodes}

@app.get("/api/governance/decisions")
async def get_governance_decisions():
    """Returns real-time AI CTO verdicts on current research papers."""
    node_ids = (await list_nodes())["nodes"]
    
    # Filter for paper nodes
    paper_ids = [nid for nid in node_ids if nid.startswith("arxiv_") or nid.startswith("s2_")]
    
    decisions = []
    # Review top 5 most recent/relevant papers to avoid too many LLM calls
    for nid in paper_ids[:5]:
        try:
            node = await get_node(nid)
            # Run CTO review
            review = governance_agent.cto_review(node["content"], mission_type="industrial")
            decisions.append({
                "topic": node["title"],
                "verdict": review["verdict"],
                "reason": review["reasoning"].split("\n")[0], # Just first line for preview
                "action": "Draft Patent Claims" if review["verdict"] == "CONTINUE" else "Archive Branch"
            })
        except Exception as e:
            print(f"Governance review failed for {nid}: {e}")
            
    return decisions

@app.post("/api/search")
async def search(query: Query):
    # Placeholder for vector search
    # In full impl, we'd use sentence-transformers to embed query.text
    return {"results": []}

# Swarm is already initialized above with broadcasting

@app.post("/api/agent/research")
async def agent_research(payload: AgentQuery):
    """Offloads the Swarm Cycle to a background worker."""
    if not task_queue:
        raise HTTPException(status_code=503, detail="Task queue unavailable (Redis required)")
    job = task_queue.enqueue("tasks.execute_research_task", payload.query)
    return {"status": "enqueued", "job_id": job.id}

@app.post("/api/swarm/full-cycle")
async def swarm_full_cycle(payload: AgentQuery):
    """Offloads the Full Sovereign Loop to a background worker."""
    if not task_queue:
        raise HTTPException(status_code=503, detail="Task queue unavailable (Redis required)")
    job = task_queue.enqueue("tasks.execute_sovereign_loop", payload.query)
    return {"status": "enqueued", "job_id": job.id}

@app.post("/api/agent/expand")
async def agent_expand(payload: NodeIdPayload):
    # Use Explorer to expand lineage
    try:
        connections = swarm.explorer.fetch_lineage(payload.id)
        new_nodes = []
        links = []
        
        # Use .get() to safely handle missing reference keys
        for ref in connections.get("references", []):
            if not ref.get("title"): continue
            ref_id = f"s2_{ref['paperId']}" if ref.get('paperId') else f"ref_{ref['title'][:10]}"
            if os.path.exists(os.path.join(STORAGE_PATH, "papers", f"{ref_id}.md")):
                links.append({"source": payload.id, "target": ref_id, "type": "cites"})
                continue

            node_data = {
                "id": ref_id,
                "title": ref["title"],
                "type": "paper",
                "content": f"Reference distilled from focus paper {payload.id}",
                "metadata": {
                    "authors": ref.get('authors', []), 
                    "external_id": ref.get('paperId'),
                    "score": ref.get('citationCount', 0)
                }
            }
            await create_node(Node(**node_data))
            new_nodes.append(node_data)
            links.append({"source": payload.id, "target": ref_id, "type": "cites"})
            
        return {
            "new_nodes": new_nodes,
            "links": links
        }
    except Exception as e:
        print(f"[!] Expansion error: {e}")
        return {"new_nodes": [], "links": []}

@app.post("/api/agent/summarize")
async def agent_summarize(payload: NodeIdPayload):
    node = await get_node(payload.id)
    prompt = f"Summarize this research paper abstract: {node['content']}"
    # Use planner or generic ask_llm
    summary = swarm.planner.ask_llm(prompt, "You are a research analyst.")
    return {"summary": summary}

@app.post("/api/agent/qa")
async def agent_qa(payload: dict):
    node = await get_node(payload['id'])
    prompt = f"Question: {payload['question']}\nContext: {node['content']}"
    answer = swarm.planner.ask_llm(prompt, "Answer only based on the research provided.")
    return {"answer": answer}

@app.post("/api/agent/run")
async def agent_run(payload: AgentQuery):
    """Full autonomous research loop: Search -> Ingest -> Expand -> Link."""
    # 1. Search
    search_results = researcher.search_arxiv(payload.query, max_results=3)
    
    all_nodes = []
    all_links = []
    
    for paper in search_results:
        # Ingest
        node_data = researcher.ingest_paper(paper)
        await create_node(Node(**node_data))
        all_nodes.append(node_data)
        
        # Auto-expand one level
        expand_res = researcher.fetch_citations(paper["id"])
        for ref in expand_res["references"][:3]: # Limit auto-expansion to 3 to avoid explosion
            ref_id = f"s2_{ref['paperId']}" if ref.get('paperId') else f"ref_{ref['title'][:10]}"
            if not os.path.exists(os.path.join(STORAGE_PATH, f"{ref_id}.md")):
                ref_node = {
                    "id": ref_id,
                    "title": ref["title"],
                    "type": "paper",
                    "content": "Deep citation discovered autonomously.",
                    "metadata": {"score": ref.get('citationCount', 0)}
                }
                await create_node(Node(**ref_node))
                all_nodes.append(ref_node)
            all_links.append({"source": paper["id"], "target": ref_id, "type": "cites"})
            
    # Semantic Linking
    for node in all_nodes:
        semantic_links = connector.find_links(node, all_nodes)
        for link in semantic_links:
            all_links.append({"source": node["id"], "target": link["target"], "type": "supports"})

    return {
        "nodes": all_nodes,
        "links": all_links,
        "summary": f"Autonomous agent explored {len(all_nodes)} papers and mapped {len(all_links)} relationships."
    }

@app.post("/api/agent/synthesis")
async def agent_synthesis():
    """Analyze current graph for contradictions and research gaps."""
    # Fetch all nodes from disk
    node_ids = (await list_nodes())["nodes"]
    nodes = []
    for nid in node_ids:
        nodes.append(await get_node(nid))
    
    # Check for contradictions between cluster pairs
    contradictions = []
    for i in range(len(nodes)):
        for j in range(i+1, len(nodes)):
            if i > 5 or j > 5: break # Cap pairwise check for performance
            
            p1 = nodes[i]
            p2 = nodes[j]
            
            prompt = f"As a RESEARCHAI Principal Investigator, evaluate these two knowledge nodes and determine if they contradict. Respond ONLY with 'CONTRADICT', 'SUPPORT', or 'NEUTRAL'.\n\nP1: {p1['content'][:300]}\n\nP2: {p2['content'][:300]}"
            relation = sme_agent.ask_llm(prompt)
            
            if "CONTRADICT" in relation.upper():
                contradictions.append({"a": p1["id"], "b": p2["id"], "type": "contradicts", "reason": relation})
    
    # Find gaps using the sovereign researcher agent
    gaps = researcher.find_gaps(nodes, [])
    gap_hypotheses = []
    for n1, n2 in gaps[:2]:
        prompt = f"RESEARCHAI PI: Propose a high-fidelity research hypothesis connecting these two nodes:\nNode A: {n1['title']}\nNode B: {n2['title']}"
        hyp = researcher.ask_llm(prompt)
        gap_hypotheses.append({"nodes": [n1["id"], n2["id"]], "hypothesis": hyp})

    return {
        "contradictions": contradictions,
        "gaps": gap_hypotheses
    }

@app.post("/api/agent/recommend")
async def agent_recommend(payload: NodeIdPayload):
    current = await get_node(payload.id)
    # Fetch random pool for recommendation (in production this would be vector search)
    node_ids = (await list_nodes())["nodes"]
    pool = []
    for nid in node_ids[:10]:
        pool.append(await get_node(nid))
    
    recommendations = researcher.recommend_next(current, pool)
    return {"recommendations": recommendations}

@app.post("/api/agent/reproduce")
async def agent_reproduce(payload: NodeIdPayload):
    node = await get_node(payload.id)
    repos = researcher.search_github(node["title"])
    
    prompt = f"RESEARCHAI PI: Given this research abstract, generate a 4-step reproduction plan for the results:\n\n{node['content']}"
    plan = researcher.ask_llm(prompt)
    
    return {
        "repositories": repos,
        "plan": plan
    }

@app.post("/api/agent/cluster")
async def agent_cluster(payload: dict):
    # payload: { node_ids: string[] }
    node_data = []
    for nid in payload['node_ids']:
        try:
            n = await get_node(nid)
            node_data.append(n)
        except:
            continue
    
    prompt = f"As a RESEARCHAI PhD Supervisor, analyze these nodes and define a high-level research cluster theme for them. Respond with a technical name and a 1-sentence synthesis.\n\nNodes: {', '.join([n['title'] for n in node_data])}"
    cluster_desc = researcher.ask_llm(prompt)
    
    return {
        "cluster_id": "cluster_" + str(hash(cluster_desc) % 10000),
        "theme": cluster_desc,
        "nodes": [n["id"] for n in node_data]
    }

@app.post("/api/agent/literature-review")
async def agent_literature_review(payload: dict):
    # payload: { paper_ids: string[] }
    papers = []
    for pid in payload['paper_ids']:
        try:
            papers.append(await get_node(pid))
        except: continue
    
    context = "\n\n".join([f"{p['title']}:\n{p['content'][:1000]}" for p in papers])[:6000]
    prompt = f"As a RESEARCHAI Principal Investigator, write a formal, PhD-level literature review based on these papers. Include Themes, Methodological Agreements, and Structural Contradictions:\n\n{context}"
    review = researcher.ask_llm(prompt)
    
    # Store insight
    insight_id = f"lit_review_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    await create_node(Node(id=insight_id, type="insight", title="Literature Review", content=review))
    
    return {"review": review, "id": insight_id}

@app.post("/api/agent/experiment-design")
async def agent_experiment_design(payload: NodeIdPayload):
    node = await get_node(payload.id)
    prompt = f"As a RESEARCHAI Principal Investigator, design a PhD-level validation experiment for this abstract. Include Hypothesis, Method, and Metrics:\n\n{node['content']}"
    experiment = researcher.ask_llm(prompt)
    
    # Store insight
    insight_id = f"exp_design_{payload.id}_{datetime.now().strftime('%H%M%S')}"
    await create_node(Node(id=insight_id, type="insight", title=f"Experiment Design: {node['title']}", content=experiment))
    
    return {"experiment": experiment, "id": insight_id}

@app.post("/api/mission/start")
async def start_mission(payload: MissionStartPayload):
    mission = mission_ctrl.start_mission(payload.goal, payload.duration_hours, payload.constraints)
    return {"status": "started", "mission": mission}

@app.get("/api/mission/status")
async def get_mission_status():
    if not mission_ctrl.active_mission:
        return {"status": "idle"}
    return mission_ctrl.active_mission

@app.post("/api/mission/stop")
async def stop_mission():
    if mission_ctrl.active_mission:
        mission_ctrl.active_mission.status = "completed"
        mission_ctrl.save_checkpoint("Manually Stopped")
        return {"status": "stopped"}
    return {"status": "not_running"}

@app.post("/api/agent/synthesis/generate")
async def generate_synthesis(payload: dict):
    # payload: { paper_ids: string[] }
    papers = []
    for pid in payload['paper_ids']:
        try:
            papers.append(await get_node(pid))
        except: continue
    
    if not papers:
        raise HTTPException(status_code=400, detail="No valid papers provided for synthesis.")
        
    try:
        # Use the sovereign synthesis agent
        report = swarm.synthesis.synthesize_full_report(papers)
        
        # Store report as an insight
        report_id = f"synthesis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        await create_node(Node(id=report_id, type="insight", title="Autonomous Research Synthesis", content=report))
        
        return {"id": report_id, "status": "success", "content": report}
    except Exception as e:
        print(f"[!] Synthesis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))




@app.post("/api/agent/patent")
async def agent_patent(payload: AgentQuery):
    """Generates a formal patent draft for a topic."""
    # Find relevant papers first
    papers = (await swarm.run_query(payload.query))["nodes"]
    proposal = swarm.planner.generate_proposal(payload.query, papers)
    patent = swarm.legal.generate_patent(proposal)
    return {"patent": patent, "base_proposal": proposal}

@app.post("/api/agent/grant")
async def agent_grant(payload: AgentQuery):
    """Generates a research grant proposal."""
    papers = (await swarm.run_query(payload.query))["nodes"]
    proposal = swarm.planner.generate_proposal(payload.query, papers)
    grant = swarm.legal.generate_grant(proposal)
    return {"grant": grant, "budget": swarm.legal.estimate_budget()}

@app.post("/api/agent/startup")
async def agent_startup(payload: AgentQuery):
    """Converts research into a startup MVP and feedback simulation."""
    papers = (await swarm.run_query(payload.query))["nodes"]
    proposal = swarm.planner.generate_proposal(payload.query, papers)
    product = swarm.incubator.research_to_product(proposal)
    mvp = swarm.incubator.generate_mvp_spec(product)
    feedback = swarm.incubator.simulate_feedback(product)
    return {
        "product": product,
        "mvp": mvp,
        "feedback": feedback
    }

# --- PhD RESEARCH TOOLS ENDPOINTS ---

@app.get("/api/research/cite")
async def get_citation(id: str, style: str = "apa"):
    node = await get_node(id)
    if style == "apa":
        return {"citation": citation_gen.format_apa(node.get("metadata", {}))}
    elif style == "ieee":
        return {"citation": citation_gen.format_ieee(node.get("metadata", {}))}
    elif style == "bibtex":
        return {"citation": citation_gen.format_bibtex(node.get("metadata", {}), id)}
    return {"citation": citation_gen.format_apa(node.get("metadata", {}))}

@app.post("/api/research/resolve")
async def resolve_research_doi(payload: dict):
    # payload: { doi?: string, title?: string }
    doi = payload.get("doi")
    if not doi and payload.get("title"):
        doi = doi_resolver.search_doi_by_title(payload["title"])
    
    if not doi:
        raise HTTPException(status_code=404, detail="DOI not found for this paper.")
    
    return doi_resolver.resolve_doi(doi)

@app.post("/api/research/export")
async def export_research_node(payload: dict):
    # payload: { id: string, format: word | ppt | pdf }
    node = await get_node(payload["id"])
    fmt = payload.get("format", "pdf")
    
    if fmt == "word":
        filename = exporter.export_to_word(node)
    elif fmt == "ppt":
        filename = exporter.export_to_ppt(node)
    else:
        filename = exporter.export_to_pdf(node)
        
    return {
        "status": "success",
        "filename": filename,
        "url": f"/api/exports/download/{filename}"
    }

@app.get("/api/exports/download/{filename}")
async def download_export(filename: str):
    path = os.path.join(exporter.export_dir, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    from fastapi.responses import FileResponse
    return FileResponse(path, filename=filename)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
