import os
import json
import redis
import time
from datetime import datetime

class StateManager:
    """Manages distributed state and real-time telemetry across workers and API."""
    
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.namespace = "research_os"
        self.connected = False
        try:
            self.client = redis.from_url(self.redis_url)
            self.client.ping()
            self.connected = True
            print(f"[*] StateManager connected to Redis: {self.redis_url}")
        except Exception as e:
            print(f"[!] Redis unavailable ({e}). Running in Safe Mode (Local Only).")
            self.client = None

    def push_log(self, message: str, status: str = "info", agent: str = "Swarm"):
        """Pushes a log entry to Redis and publishes an update event."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "status": status,
            "agent": agent
        }
        
        if not self.connected:
            return
            
        try:
            # 1. Store in a Redis list (Recent history)
            self.client.lpush(f"{self.namespace}:logs", json.dumps(log_entry))
            self.client.ltrim(f"{self.namespace}:logs", 0, 999) # Keep last 1000
            
            # 2. Publish for WebSocket broadcast
            self.client.publish(f"{self.namespace}:events", json.dumps({
                "type": "log",
                "data": log_entry
            }))
        except Exception as e:
            print(f"[!] push_log failure: {e}")

    def update_graph(self, nodes: list, links: list = None):
        """Updates the global graph state in Redis and triggers a sync event."""
        graph_data = {
            "nodes": nodes,
            "links": links or [],
            "last_update": time.time()
        }
        
        if not self.connected:
            return
            
        try:
            # 1. Update the persistened graph hash
            self.client.set(f"{self.namespace}:graph", json.dumps(graph_data))
            
            # 2. Publish sync event
            self.client.publish(f"{self.namespace}:events", json.dumps({
                "type": "graph_update",
                "data": graph_data
            }))
        except Exception as e:
            print(f"[!] update_graph failure: {e}")

    def get_full_state(self) -> dict:
        """Retrieves the complete system state for initial frontend hydration."""
        default_state = {"graph": {"nodes": [], "links": []}, "logs": []}
        
        if not self.connected:
            return default_state
            
        try:
            graph_raw = self.client.get(f"{self.namespace}:graph")
            graph = json.loads(graph_raw) if graph_raw else default_state["graph"]
            
            logs_raw = self.client.lrange(f"{self.namespace}:logs", 0, 100)
            logs = [json.loads(l) for l in logs_raw] if logs_raw else []
            
            return {
                "graph": graph,
                "logs": logs
            }
        except Exception as e:
            print(f"[!] get_full_state failure: {e}")
            return default_state

    def clear_state(self):
        """Resets the system state for a new mission."""
        if not self.connected:
            return
            
        try:
            self.client.delete(f"{self.namespace}:logs")
            self.client.delete(f"{self.namespace}:graph")
            self.client.publish(f"{self.namespace}:events", json.dumps({"type": "reset"}))
        except Exception as e:
            print(f"[!] clear_state failure: {e}")
