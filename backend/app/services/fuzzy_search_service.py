import difflib

class FuzzySearchService:
    def __init__(self, items: list[str]):
        self.items = items
        
    def search(self, query: str, threshold: float = 0.6) -> list[str]:
        """
        Perform fuzzy matching against a list of known items (e.g., booth names, locations).
        """
        matches = difflib.get_close_matches(query, self.items, n=5, cutoff=threshold)
        return matches

def fuzzy_match_location(query: str, known_locations: list[str]) -> str | None:
    search_service = FuzzySearchService(known_locations)
    matches = search_service.search(query)
    if matches:
        return matches[0]
    return None
