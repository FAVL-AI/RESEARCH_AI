import requests
from typing import Optional, List

class DOIResolver:
    """Resolves DOIs to full-text URLs or primary landing pages with institutional support."""
    
    def __init__(self, proxy_base: Optional[str] = None):
        self.crossref_api = "https://api.crossref.org/works/"
        self.unpaywall_api = "https://api.unpaywall.org/v2/"
        self.core_api = "https://api.core.ac.uk/v3/discover"
        self.email = "researcher@example.com"
        self.proxy_base = proxy_base

    def resolve_doi(self, doi: str) -> dict:
        """Attempts to find the best full-text URL for a DOI."""
        results = {
            "doi": doi,
            "url": f"https://doi.org/{doi}",
            "pdf_url": None,
            "is_open_access": False,
            "source": "primary_doi_link"
        }
        
        # 1. Try Unpaywall for PDF
        try:
            upw_url = f"{self.unpaywall_api}{doi}?email={self.email}"
            r = requests.get(upw_url, timeout=5)
            if r.status_code == 200:
                data = r.json()
                results["is_open_access"] = data.get("is_oa", False)
                best_oa = data.get("best_oa_location")
                if best_oa:
                    results["pdf_url"] = best_oa.get("url_for_pdf") or best_oa.get("url")
                    results["source"] = "unpaywall"
        except Exception as e:
            print(f"Unpaywall error: {e}")

        return results

    def get_institutional_proxy(self, url: str, proxy_base: Optional[str] = None) -> str:
        """Appends institutional proxy prefix if provided."""
        if not proxy_base:
            return url
        return f"{proxy_base.rstrip('/')}/{url.replace('https://', '').replace('http://', '')}"

    def search_doi_by_title(self, title: str) -> Optional[str]:
        """Fallback: Search for DOI using paper title."""
        try:
            params = {"query.title": title, "rows": 1}
            r = requests.get(self.crossref_api, params=params, timeout=5)
            if r.status_code == 200:
                items = r.json().get("message", {}).get("items", [])
                if items:
                    return items[0].get("DOI")
        except Exception as e:
            print(f"DOI Search error: {e}")
        return None
