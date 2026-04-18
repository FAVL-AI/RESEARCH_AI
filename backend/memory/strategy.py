import json
import os
from typing import List, Dict

class StrategyStore:
    """Stores and evolves autonomous research strategies based on mission success."""
    
    def __init__(self, storage_path: str):
        self.storage_path = os.path.join(storage_path, "strategies.json")
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        self.strategies = self._load()

    def _load(self) -> List[Dict]:
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []

    def save(self):
        with open(self.storage_path, 'w') as f:
            json.dump(self.strategies, f, indent=2)

    def add_strategy(self, agent_name: str, strategy: str, score: float, results: str):
        """Record a successful strategy for future replication."""
        self.strategies.append({
            "agent": agent_name,
            "strategy": strategy,
            "score": score,
            "results": results[:500],
            "timestamp": os.path.getmtime(self.storage_path) if os.path.exists(self.storage_path) else 0
        })
        # Keep only top 20 successful strategies
        self.strategies = sorted(self.strategies, key=lambda x: x["score"], reverse=True)[:20]
        self.save()

    def get_best_strategies(self, agent_name: str) -> List[str]:
        """Retrieve the most effective past strategies for a specific agent type."""
        return [s["strategy"] for s in self.strategies if s["agent"] == agent_name][:5]
