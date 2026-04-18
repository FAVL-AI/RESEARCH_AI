import os
import time
import json
import requests
from typing import List, Dict
from datetime import datetime

class SourceManager:
    """Manages ingestion and synchronization from various sources (Local, GitHub, Notion)."""
    
    def __init__(self, storage_path: str):
        self.storage_path = storage_path
        self.sources_file = os.path.join(storage_path, "sources.json")
        self.manifest = self._load_manifest()

    def _load_manifest(self) -> Dict:
        if os.path.exists(self.sources_file):
            with open(self.sources_file, "r") as f:
                return json.load(f)
        return {"sources": [], "last_sync": None}

    def _save_manifest(self):
        with open(self.sources_file, "w") as f:
            json.dump(self.manifest, f, indent=2)

    def add_local_source(self, path: str, name: str = None):
        """Adds a local directory (e.g. Desktop, Pendrive) as a source."""
        if not os.path.exists(path):
            raise Exception(f"Path does not exist: {path}")
            
        source_id = f"local_{int(time.time())}"
        self.manifest["sources"].append({
            "id": source_id,
            "type": "local",
            "name": name or os.path.basename(path),
            "path": path,
            "added_at": datetime.now().isoformat(),
            "status": "connected"
        })
        self._save_manifest()
        return source_id

    def add_uploaded_file(self, file_path: str, original_filename: str):
        """Registers a specific uploaded file into the sovereign archive."""
        # Check if an 'uploads' group exists
        u_source = next((s for s in self.manifest["sources"] if s["id"] == "local_uploads"), None)
        if not u_source:
             u_source = {
                 "id": "local_uploads",
                 "type": "local",
                 "name": "Sovereign Imports",
                 "path": os.path.dirname(file_path),
                 "added_at": datetime.now().isoformat(),
                 "status": "connected",
                 "files": []
             }
             self.manifest["sources"].append(u_source)
        
        if original_filename not in u_source.get("files", []):
            if "files" not in u_source: u_source["files"] = []
            u_source["files"].append(original_filename)
        
        self._save_manifest()
        return "local_uploads"

    def add_git_source(self, provider_type: str, url: str, token: str = None, name: str = None):
        """Adds a Git repository (GitHub, GitLab, GitBucket) as a source."""
        source_id = f"{provider_type}_{int(time.time())}"
        self.manifest["sources"].append({
            "id": source_id,
            "type": provider_type,
            "url": url,
            "name": name or url.split("/")[-1],
            "token_provided": bool(token),
            "added_at": datetime.now().isoformat(),
            "status": "pending"
        })
        self._save_manifest()
        return source_id

    def add_github_source(self, repo_url: str, token: str = None):
        return self.add_git_source("github", repo_url, token)

    def add_notion_source(self, page_id: str, secret: str):
        """Adds a Notion page/database as a source."""
        source_id = f"notion_{int(time.time())}"
        self.manifest["sources"].append({
            "id": source_id,
            "type": "notion",
            "page_id": page_id,
            "added_at": datetime.now().isoformat(),
            "status": "pending"
        })
        self._save_manifest()
        return source_id

    def scan_path(self, source_id: str) -> List[str]:
        """Recursively scans a local source path for research files."""
        source = next((s for s in self.manifest["sources"] if s["id"] == source_id), None)
        if not source or source["type"] != "local":
            return []
            
        found_files = []
        exts = {
            ".pdf", ".md", ".txt", ".py", ".json", ".docx", ".xlsx", 
            ".csv", ".ppt", ".pptx", ".html", ".glb", ".ply", ".ipynb", ".zip"
        }
        
        for root, _, files in os.walk(source["path"]):
            for file in files:
                if any(file.endswith(ext) for ext in exts):
                    found_files.append(os.path.join(root, file))
                    
        return found_files

    def sync_all(self):
        """Triggers a scan and sync for all registered sources."""
        for source in self.manifest["sources"]:
            if source["type"] == "local":
                files = self.scan_path(source["id"])
                source["file_count"] = len(files)
                source["last_scan"] = datetime.now().isoformat()
                
        self.manifest["last_sync"] = datetime.now().isoformat()
        self._save_manifest()
        return self.manifest["sources"]

    def get_sources(self) -> List[Dict]:
        return self.manifest["sources"]
