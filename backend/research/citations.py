from typing import List, Optional
from datetime import datetime

class CitationGenerator:
    """Generates formatted academic citations in multiple styles."""
    
    def format_apa(self, metadata: dict) -> str:
        """Example: Author, A. A. (Year). Title of paper. Source."""
        authors = self._format_authors_apa(metadata.get("authors", []))
        year = self._get_year(metadata)
        title = metadata.get("title", "Untitled")
        source = metadata.get("source", "ArXiv")
        
        return f"{authors} ({year}). {title}. {source}."

    def format_ieee(self, metadata: dict) -> str:
        """Example: [1] A. Author, \"Title of paper,\" Source, Year."""
        authors = self._format_authors_ieee(metadata.get("authors", []))
        title = metadata.get("title", "Untitled")
        source = metadata.get("source", "ArXiv")
        year = self._get_year(metadata)
        
        return f"{authors}, \"{title},\" {source}, {year}."

    def format_bibtex(self, metadata: dict, node_id: str) -> str:
        """Standard BibTeX entry."""
        authors = " and ".join(metadata.get("authors", ["Unknown"]))
        title = metadata.get("title", "Untitled")
        year = self._get_year(metadata)
        journal = metadata.get("source", "ArXiv")
        
        return f"""@article{{{node_id},
  author = {{{authors}}},
  title = {{{title}}},
  journal = {{{journal}}},
  year = {{{year}}}
}}"""

    def _format_authors_apa(self, authors: List[str]) -> str:
        if not authors: return "Unknown Author"
        if len(authors) == 1: return authors[0]
        if len(authors) == 2: return f"{authors[0]} & {authors[1]}"
        return f"{authors[0]}, et al."

    def _format_authors_ieee(self, authors: List[str]) -> str:
        if not authors: return "Unknown Author"
        formatted = []
        for a in authors:
            parts = a.split(" ")
            if len(parts) > 1:
                initial = f"{parts[0][0]}."
                last = parts[-1]
                formatted.append(f"{initial} {last}")
            else:
                formatted.append(a)
        
        if len(formatted) > 3:
            return f"{formatted[0]} et al."
        return ", ".join(formatted)

    def _get_year(self, metadata: dict) -> str:
        # Try to extract year from various metadata fields
        for field in ["year", "published", "date"]:
            val = metadata.get(field)
            if val:
                # Basic string parsing for YYYY
                import re
                match = re.search(r'\d{4}', str(val))
                if match:
                    return match.group()
        return str(datetime.now().year)
