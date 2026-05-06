import re

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except ImportError:
    nlp = None

def extract_location(text: str) -> str:
    """
    Extract location from text using spaCy (if available) and regex fallback.
    """
    if nlp:
        doc = nlp(text)
        locations = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]
        if locations:
            return locations[0]
            
    # Regex fallback
    match = re.search(r'(in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text)
    if match:
        return match.group(2)
        
    return ""

def identify_intent(text: str) -> str:
    """
    Identify user intent based on keywords.
    """
    text = text.lower()
    if "where" in text or "location" in text or "booth" in text:
        return "location_query"
    if "document" in text or "upload" in text or "id" in text:
        return "document_upload"
    if "remind" in text or "alert" in text:
        return "reminder_setup"
    return "general_query"
