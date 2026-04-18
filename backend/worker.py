import os
import redis
from rq import Worker, Queue, Connection
from agents.swarm import SwarmController

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
STORAGE_PATH = "/app/data/memory" if os.getenv("IS_WORKER") else os.path.join(os.getcwd(), "data", "memory")

def run_worker():
    """Starts an RQ worker to execute autonomous research tasks."""
    print(f"[*] Starting Research-OS Worker")
    print(f"[*] Redis: {REDIS_URL}")
    print(f"[*] Storage: {STORAGE_PATH}")
    
    conn = redis.from_url(REDIS_URL)
    
    # Pre-initialize swarm to avoid loading models on every task
    # This keeps the worker hot and fast.
    global swarm
    swarm = SwarmController(STORAGE_PATH)

    with Connection(conn):
        worker = Worker(["default"])
        worker.work()

if __name__ == "__main__":
    run_worker()
