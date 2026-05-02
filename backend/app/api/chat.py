from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from app.db.session import get_db
from app.ai.rag_pipeline import RAGPipeline
from app.services.decision_engine import DecisionEngine
from app.services.user_context import get_user_context
from app.services.interaction_service import log_interaction

router = APIRouter(prefix="/chat", tags=["Chat"])

# Initialize once
rag = RAGPipeline()
engine = DecisionEngine(rag)

# Request Schema
class ChatRequest(BaseModel):
    user_id: int
    message: str


# Response Schema
class ChatResponse(BaseModel):
    answer: str
    source: str
    sources: List[str] = []
    meta: Dict[str, Any] = {}


# Chat Endpoint
@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):

    #  Fetch user context from DB
    user_context = get_user_context(db, request.user_id)

    if not user_context:
        return {
            "answer": "User not found",
            "source": "system",
            "sources": [],
            "meta": {}
        }

    #  SIMPLE LOGGING
    print("\n======================")
    print("USER:", request.user_id)
    print("STATE:", user_context.get("state"))
    print("QUERY:", request.message)

    try:
        #  Route through decision engine
        result = engine.route(
            query=request.message,
            context=user_context,
            db=db
        )

        #  LOG OUTPUT
        print("ROUTE:", result.get("source"))
        print("SOURCES:", result.get("sources", []))
        print("META:", result.get("meta", {}))

    except Exception as e:
        print("ERROR:", str(e))

        return {
            "answer": "Something went wrong. Please try again.",
            "source": "error",
            "sources": [],
            "meta": {"error": str(e)}
        }

    #  LOG INTERACTION
    log_interaction(
        db=db,
        user_id=request.user_id,
        query=request.message,
        response=result.get("answer"),
        intent=engine.detect_intent(request.message),
        state=result.get("meta", {}).get("current_stage")
    )

    #  RETURN RESPONSE
    return {
        "success": True,
        "message": result.get("answer"),
        "data": {
            "source": result.get("source"),
            "sources": result.get("sources", [])
        },
        "meta": result.get("meta")
    }
