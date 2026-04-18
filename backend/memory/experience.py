import json
import os
from datetime import datetime

class ExperienceStore:
    """Stores and retrieves agent experiences to improve swarm intelligence over time."""
    
    def __init__(self, storage_path: str):
        self.path = os.path.join(storage_path, "experience")
        os.makedirs(self.path, exist_ok=True)
        self.log_file = os.path.join(self.path, "agent_reflections.json")
        
        if not os.path.exists(self.log_file):
            with open(self.log_file, "w") as f:
                json.dump([], f)

    def add_experience(self, agent_name: str, action: str, result: str, reflection: str, score: float):
        """Logs a new agent experience with meta-cognition data."""
        experience = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "action": action,
            "result": result[:500] if result else "", # Truncate for efficiency
            "reflection": reflection,
            "score": score
        }
        
        with open(self.log_file, "r+") as f:
            logs = json.load(f)
            logs.append(experience)
            f.seek(0)
            json.dump(logs[-500:], f, indent=2) # Keep last 500 experiences

    def get_best_practices(self, agent_name: str = None, limit: int = 5) -> str:
        """Retrieves top-scored past experiences to assist in planning."""
        try:
            with open(self.log_file, "r") as f:
                logs = json.load(f)
        except:
            return "No prior experience available."
            
        relevant = [l for l in logs if not agent_name or l["agent"] == agent_name]
        best = sorted(relevant, key=lambda x: x["score"], reverse=True)[:limit]
        
        if not best:
            return "No relevant successful strategies found yet."
            
        summary = "\n---\n".join([
            f"STRATEGY: {l['action']}\nREFLECTION: {l['reflection']}\nSUCCESS SCORE: {l['score']}" 
            for l in best
        ])
        return summary
