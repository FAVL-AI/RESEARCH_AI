import os
from agents.swarm import SwarmController

STORAGE_PATH = "/app/data/memory" if os.getenv("IS_WORKER") else os.path.join(os.getcwd(), "data", "memory")

def execute_research_task(topic: str):
    """Entry point for the RQ worker to run a research cycle."""
    swarm = SwarmController(STORAGE_PATH)
    # We use the blocking run_query here as it's running in its own process
    import asyncio
    return asyncio.run(swarm.run_query(topic))

def execute_sovereign_loop(topic: str):
    """Entry point for the RQ worker to run the full industrial loop."""
    swarm = SwarmController(STORAGE_PATH)
    import asyncio
    return asyncio.run(swarm.full_sovereign_loop(topic))
