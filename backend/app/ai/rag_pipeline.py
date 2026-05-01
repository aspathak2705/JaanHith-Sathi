import json
import os
import faiss
import numpy as np

from app.ai.embeddings import EmbeddingModel
from app.ai.llm import LLMService
from app.ai.prompt_templates import RAG_PROMPT


class RAGPipeline:
    def __init__(self, data_path=None):
        #  Initialize models
        self.embedding_model = EmbeddingModel()
        self.llm = LLMService()

        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(__file__))  
            data_path = os.path.join(base_dir, "data", "faqs.json")

        #  Load knowledge base
        self.documents = self.load_documents(data_path)
        self.texts = [doc["content"] for doc in self.documents]

        # Create embeddings
        self.embeddings = self.embedding_model.embed(self.texts)

        #  Build FAISS index
        self.index = self.build_faiss_index(self.embeddings)

    # Load Documents
    def load_documents(self, path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    
    # Build FAISS Index
    def build_faiss_index(self, embeddings):
        embeddings = np.array(embeddings).astype("float32")

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)

        return index

    #  Retrieve Relevant Docs
    def retrieve(self, query, top_k=2):
        query_embedding = self.embedding_model.embed([query])
        query_embedding = np.array(query_embedding).astype("float32")

        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for idx in indices[0]:
            if idx < len(self.documents):
                results.append(self.documents[idx])

        return results

    # Generate Answer (RAG + LLM)
    def generate_answer(self, query, debug=False):
        retrieved_docs = self.retrieve(query)

        # 🔹 Build context (structured)
        context = "\n\n".join([
            f"{doc['title']}:\n{doc['content']}"
            for doc in retrieved_docs
        ])

        #  Debug (VERY useful)
        if debug:
            print("\n📄 Retrieved Context:\n", context)

        #  Create prompt
        prompt = RAG_PROMPT.format(
            context=context,
            question=query
        )

        #  Generate answer
        answer = self.llm.generate(prompt)

        if "I don't have enough information" in answer:
            return {
                "answer": answer.strip(),
                "sources": []  #  remove fake sources
            }

        return {
            "answer": answer.strip(),
            "Source":"rag",
            "sources": [doc["id"] for doc in retrieved_docs],
            "meta":{}
        }