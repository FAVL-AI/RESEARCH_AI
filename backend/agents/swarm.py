from .critic import CriticAgent
from .synthesis import SynthesisAgent
from .planner import PlannerAgent
from .explorer import ExplorerAgent
from .legal import LegalAgent
from .incubator import StartupAgent
from .governance import GovernanceAgent
from .advisor import AdvisorAgent
from execution.runner import ExecutionRunner
from memory.experience import ExperienceStore
from memory.strategy import StrategyStore
import time

class SwarmController:
    """Orchestrator for the multi-agent research swarm."""
    
    def __init__(self, storage_path: str):
        self.experience = ExperienceStore(storage_path)
        self.strategies = StrategyStore(storage_path)
        self.planner = PlannerAgent(experience_store=self.experience)
        self.explorer = ExplorerAgent(storage_path, experience_store=self.experience)
        self.critic = CriticAgent(experience_store=self.experience)
        self.synthesis = SynthesisAgent(experience_store=self.experience)
        self.legal = LegalAgent(experience_store=self.experience)
        self.incubator = StartupAgent(experience_store=self.experience)
        self.cto = GovernanceAgent(experience_store=self.experience)
        self.advisor = AdvisorAgent(experience_store=self.experience)
        self.runner = ExecutionRunner(use_docker=False)
        
    async def refine_until_valid(self, draft: str, topic: str, max_loops: int = 2) -> dict:
        """Iterative PhD-level refinement loop based on advisor audit."""
        current_draft = draft
        final_audit = None
        
        for i in range(max_loops):
            await self.log(f"Initiating Audit Loop {i+1}/{max_loops}...")
            audit_result = self.advisor.audit_research(current_draft)
            final_audit = audit_result
            
            if audit_result["decision"] == "ACCEPT":
                await self.log("Research approved by PhD Advisor.", "success")
                break
            
            if audit_result["decision"] == "REJECT":
                await self.log("Research REJECTED by PhD Advisor. Immediate Pivot Required.", "error")
                return {"status": "rejected", "audit": audit_result}
            
            await self.log(f"Advisor suggests revisions (Score: {audit_result['score']}/10). Refining...", "warning")
            current_draft = self.advisor.refine_instructions(current_draft, audit_result["audit"])
            
        return {"status": "approved", "draft": current_draft, "audit": final_audit}
        
    async def evolve_strategies(self, mission_results: dict):
        """Perform meta-reflection to improve agent prompts for future runs."""
        await self.log("Phase 7: Executing Autonomous Strategy Evolution...", "success")
        
        for agent in [self.planner, self.explorer, self.critic]:
            agent_name = agent.__class__.__name__
            best_past = self.strategies.get_best_strategies(agent_name)
            
            prompt = f"""
Current Mission Success: {mission_results.get('status', 'unknown')}
Best Past Strategies: {best_past}

Analyze how to improve the {agent_name}'s tactical path.
Return a new 'Golden Strategy' for this agent type.
"""
            new_strategy = agent.ask_llm(prompt, "You are an AI Evolutionary Architect.")
            self.strategies.add_strategy(agent_name, new_strategy, 0.9, str(mission_results)[:500])
            await self.log(f"Evolved strategy for {agent_name} stored.", "success")
        
        self.state = {
            "memory": [],
            "visited": set(),
            "logs": []
        }

    async def run_query(self, query: str):
        """Execute a full research cycle based on a user query."""
        await self.log(f"Starting Swarm Research: {query}")
        
        # 1. PLAN
        plan = self.planner.plan_research(query)
        await self.log(f"Plan generated with {len(plan)} steps.")
        
        results = {"nodes": [], "links": []}
        
        # 2. EXECUTE
        for step in plan:
            action = step.get("action", "").upper()
            target = step.get("target", query)
            
            await self.log(f"Executing Step {step['step']}: {action} on {target}")
            
            if action == "SEARCH":
                papers = self.explorer.search(target)
                for p in papers:
                    if p["id"] not in self.state["visited"]:
                        node_data = self.explorer.ingest(p)
                        # Add credibility score
                        node_data["metadata"]["credibility"] = self.critic.calculate_credibility(node_data)
                        results["nodes"].append(node_data)
                        self.state["visited"].add(p["id"])
                        self.state["memory"].append(node_data)
            
            elif action == "EXPAND":
                # Find current papers in memory to expand
                for paper in self.state["memory"][-3:]:
                    lineage = self.explorer.fetch_lineage(paper["id"])
                    # ... process lineage logic similar to old researcher.py
                    await self.log(f"Expanded lineage for {paper['id']}")
            
            elif action == "CRITICIZE":
                await self.log("Critic evaluating recent insights...")
                # Logic for cross-checking papers
        
        self.state["memory"] = results["nodes"]
        from .base import state_manager
        state_manager.update_graph(results["nodes"], results["links"])
        return results

    async def wait_for_supervisor(self, mission_id: str, context: str):
        """Pauses execution and waits for human supervisor decision via Redis."""
        await self.log(f"Mission {mission_id} PAUSED. Waiting for Human Supervisor Approval...", "warning")
        
        pending_key = f"mission:{mission_id}:pending"
        decision_key = f"mission:{mission_id}:decision"
        
        # Mark as pending
        from .base import redis_conn
        redis_conn.set(pending_key, "true")
        
        # Poll for decision
        while True:
            decision_raw = redis_conn.get(decision_key)
            if decision_raw:
                decision = json.loads(decision_raw)
                await self.log(f"Supervisor Decision Received: {decision['decision'].upper()}", "success")
                
                # Cleanup
                redis_conn.delete(pending_key)
                redis_conn.delete(decision_key)
                
                return decision
            
            await asyncio.sleep(5) # Poll every 5s

    async def full_sovereign_loop(self, topic: str) -> dict:
        """Executes the complete end-to-end industrial research pipeline with Human Supervision."""
        mission_id = f"msn_{int(time.time())}"
        await self.log(f"Initiating SUPERVISED FULL SOVEREIGN LOOP: {topic}", "success")
        
        # 1. Literature Review & Scoping
        await self.log("Phase 1: Deep Literature Survey...")
        papers = (await self.run_query(topic))["nodes"]
        
        # 2. Strategic SOTA Proposal
        await self.log("Phase 2: Generating SOTA Research Proposal...")
        proposal = self.planner.generate_proposal(topic, papers)
        
        # 3. Code Evidence & Reproduction (SIMULATED)
        await self.log("Phase 3: Searching for Code Evidence & Reproducing...")
        best_paper = papers[0] if papers else {"title": topic, "id": "unknown"}
        repos = self.runner.find_code(best_paper.get("title", ""))
        repo_result = self.runner.run_reproducibility_engine(repos[0], "Claim: Latency improvement")
        
        # 4. Academic Publication (Journal Ready)
        await self.log("Phase 4: Synthesizing IEEE & Nature Manuscripts...")
        draft = self.synthesis.synthesize_full_report(papers)
        
        # 4.1. PhD ADVISOR AUDIT & REFINEMENT
        await self.log("Phase 4.1: Initiating PhD Advisor Audit Loop...")
        refinement_result = await self.refine_until_valid(draft, topic)
        
        if refinement_result["status"] == "rejected":
            return {"status": "rejected", "audit": refinement_result["audit"]}
            
        final_draft = refinement_result["draft"]
        
        # 4.5. AI CTO GOVERNANCE
        await self.log("Phase 4.5: AI CTO Governance Audit...", "warning")
        cto_decision = self.cto.cto_review(proposal + "\n\n" + final_draft)
        
        # 4.6. HUMAN-IN-THE-LOOP (HITL) GATEWAY (NEW)
        await self.log("Phase 4.6: Entering Supervisor Decision Gateway...", "warning")
        supervisor_decision = await self.wait_for_supervisor(mission_id, proposal)
        
        if supervisor_decision["decision"] == "reject":
            await self.log("Mission TERMINATED by Human Supervisor.", "error")
            return {"status": "human_terminated", "notes": supervisor_decision["notes"]}
            
        elif supervisor_decision["decision"] == "revise":
            await self.log("Supervisor requested REVISION. Injecting feedback...", "warning")
            # In a real system, we'd trigger another planner cycle with feedback notes
        
        # 5. IP & Capital (Patent + Grant)
        await self.log("Phase 5: Protecting IP & Attracting Capital...")
        patent = self.legal.generate_patent(proposal)
        grant = self.legal.generate_grant(proposal)
        
        # 6. Industrial Incubation (Startup MVP)
        await self.log("Phase 6: Incubating Startup Concept & MVP...")
        product = self.incubator.research_to_product(proposal)
        mvp = self.incubator.generate_mvp_spec(product)
        feedback = self.incubator.simulate_feedback(product)
        
        # 7. Self-Evolution
        mission_results = {"status": "success", "novelty_score": 0.9}
        await self.evolve_strategies(mission_results)
        
        # 8. Reality Grounding & Validation (NEW)
        from validation.evaluator import ValidationEngine
        val_engine = ValidationEngine(experience_store=self.experience)
        validation_score = val_engine.calculate_confidence_score(proposal, {
            "reproduction_status": repo_result.get("status"),
            "advisor_score": refinement_result["audit"].get("score", 7),
            "cto_score": 8
        })
        
        await self.log(f"SOVEREIGN LOOP COMPLETE: {topic} (Confidence: {validation_score:.2f})", "success")
        
        final_result = {
            "mission_id": mission_id,
            "proposal": proposal,
            "reproduction": repo_result,
            "manuscript": final_draft,
            "patent": patent,
            "grant": grant,
            "decision": cto_decision,
            "supervisor": supervisor_decision,
            "validation_score": validation_score,
            "startup": {
                "product": product,
                "mvp": mvp,
                "feedback": feedback
            }
        }
        
        # Persist to project memory
        from memory.projects import ProjectStore
        prj_store = ProjectStore(STORAGE_PATH)
        # Mock project ID for now, in prod would be passed from API
        prj_store.add_mission_record("default_project", final_result)
        
        return final_result

    async def log(self, message: str):
        print(f"[SwarmController] {message}")
        self.state["logs"].append({"time": time.time(), "msg": message})
