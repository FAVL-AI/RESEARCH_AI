import time
import json
import os
from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel

class MissionState(BaseModel):
    goal: str
    constraints: List[str]
    start_time: float
    end_time: float
    status: str = "running" # running, paused, completed, failed
    progress: float = 0.0
    checkpoints: List[dict] = []
    current_knowledge_size: int = 0

class MissionController:
    """Manages long-running autonomous research missions."""
    
    def __init__(self, storage_path: str, swarm):
        self.storage_path = storage_path
        self.swarm = swarm
        self.mission_file = os.path.join(storage_path, "mission_state.json")
        self.active_mission: Optional[MissionState] = None

    def start_mission(self, goal: str, duration_hours: int, constraints: List[str] = []):
        """Initializes and starts a 48h+ autonomous research mission."""
        end_time = time.time() + (duration_hours * 3600)
        self.active_mission = MissionState(
            goal=goal,
            constraints=constraints,
            start_time=time.time(),
            end_time=end_time,
            current_knowledge_size=len(self.swarm.state["memory"])
        )
        self.save_checkpoint("Mission Initialized")
        return self.active_mission

    def save_checkpoint(self, summary: str):
        """Persists the current mission state to disk."""
        if not self.active_mission:
            return
            
        checkpoint = {
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "memory_snapshot": len(self.swarm.state["memory"]),
            "logs_count": len(self.swarm.state["logs"])
        }
        self.active_mission.checkpoints.append(checkpoint)
        self.active_mission.progress = min(100.0, (time.time() - self.active_mission.start_time) / (self.active_mission.end_time - self.active_mission.start_time) * 100)
        
        with open(self.mission_file, "w") as f:
            f.write(self.active_mission.json())

    def resume_mission(self):
        """Loads and resumes a mission from mission_state.json."""
        if os.path.exists(self.mission_file):
            with open(self.mission_file, "r") as f:
                data = json.load(f)
                self.active_mission = MissionState(**data)
                self.active_mission.status = "running"
                return self.active_mission
        return None

    async def run_mission_step(self):
        """Executes a single autonomous step in the mission loop."""
        if not self.active_mission or self.active_mission.status != "running":
            return
            
        if time.time() > self.active_mission.end_time:
            self.active_mission.status = "completed"
            self.save_checkpoint("Mission Time Limit Reached - Completed")
            return
            
        # 1. Adapt Strategy based on Progress
        strategy_prompt = f"Goal: {self.active_mission.goal}. Progress: {self.active_mission.progress:.1f}%. Current Knowledge Cluster Count: {self.active_mission.current_knowledge_size}."
        
        # 2. Run Swarm Cycle
        results = await self.swarm.run_query(self.active_mission.goal)
        
        # 3. Update State
        self.active_mission.current_knowledge_size = len(self.swarm.state["memory"])
        
        # 4. Checkpoint
        self.save_checkpoint(f"Swarm Cycle Complete. Found {len(results['nodes'])} relevant structural nodes.")
        
        return results
