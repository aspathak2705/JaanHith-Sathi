from sentence_transformers import SentenceTransformer

class EmbeddingModel:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed(self, texts):
        """
        Accepts list of texts → returns embeddings
        """
        return self.model.encode(texts, show_progress_bar=False)