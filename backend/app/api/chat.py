from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.rag_pipeline import RAGPipeline
from app.services.decision_engine import DecisionEngine
from app.services.user_context import get_user_context

router = APIRouter()

#  Initialize once 
rag = RAGPipeline()
engine = DecisionEngine(rag)


#  Request Schema
class ChatRequest(BaseModel):
    user_id: str
    message: str


#  Response Schema
class ChatResponse(BaseModel):
    answer: str
    source: str
    sources: list[str] = []
    meta: dict = {}   # added for future phases


#  Chat Endpoint
@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    # 🔹 Get user context (Phase 2 → mock, Phase 3 → DB)
    user_context = get_user_context(request.user_id)

    #  SIMPLE LOGGING 
    print("\n======================")
    print("USER:", request.user_id)
    print("QUERY:", request.message)

    try:
        #  Route through decision engine
        result = engine.route(request.message, user_context)

        #  LOG OUTPUT (VERY IMPORTANT)
        print("ROUTE:", result.get("source"))
        print("SOURCES:", result.get("sources", []))

    except Exception as e:
        print("ERROR:", str(e))

        return {
            "answer": "Something went wrong. Please try again.",
            "source": "error",
            "sources": [],
            "meta": {"error": str(e)}
        }

    return {
        "answer": result["answer"],
        "source": str(result.get("source") or "unknown"),
        "sources": result.get("sources", []),
        "meta": result.get("meta", {})
    }