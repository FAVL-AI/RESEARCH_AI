import json
import os
import time
from typing import List, Dict

class ProjectStore:
    """Manages multi-researcher workspaces and project-specific mission state."""
    
    def __init__(self, base_path: str):
        self.projects_path = os.path.join(base_path, "projects.json")
        os.makedirs(os.path.dirname(self.projects_path), exist_ok=True)
        self.projects = self._load()

    def _load(self) -> Dict:
        if os.path.exists(self.projects_path):
            try:
                with open(self.projects_path, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def save(self):
        with open(self.projects_path, 'w') as f:
            json.dump(self.projects, f, indent=2)

    def create_project(self, name: str, researcher_id: str) -> str:
        project_id = f"prj_{int(time.time())}"
        self.projects[project_id] = {
            "id": project_id,
            "name": name,
            "researcher_id": researcher_id,
            "created_at": time.time(),
            "missions": [],
            "graph": {"nodes": [], "links": []},
            "audit_log": []
        }
        self.save()
        return project_id

    def get_project(self, project_id: str) -> Dict:
        return self.projects.get(project_id)

    def add_mission_record(self, project_id: str, mission_data: Dict):
        if project_id in self.projects:
            self.projects[project_id]["missions"].append(mission_data)
            self.save()

    def list_projects(self) -> List[Dict]:
        return list(self.projects.values())
