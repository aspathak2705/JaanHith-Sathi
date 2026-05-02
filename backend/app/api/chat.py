from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.rag_pipeline import RAGPipeline
from app.db.session import get_db
from app.services.decision_engine import DecisionEngine
from app.services.interaction_service import log_interaction
from app.services.location_service import get_booths, get_nearest_booths
from app.services.user_context import get_user_context

router = APIRouter(prefix="/chat", tags=["Chat"])

intent_engine = DecisionEngine(None)
phase3_engine = None


def get_phase3_engine() -> DecisionEngine:
    global phase3_engine
    if phase3_engine is None:
        phase3_engine = DecisionEngine(RAGPipeline())
    return phase3_engine


class ChatRequest(BaseModel):
    user_id: int
    message: str
    district: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ChatResponse(BaseModel):
    answer: str
    source: str
    sources: List[str] = []
    meta: Dict[str, Any] = {}


def _log_and_return(
    db: Session,
    user_id: int,
    query: str,
    response: Dict[str, Any],
    intent: str,
):
    log_interaction(
        db=db,
        user_id=user_id,
        query=query,
        response=response.get("answer"),
        intent=intent,
        state=response.get("meta", {}).get("current_stage"),
    )
    return response


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    user_context = get_user_context(db, request.user_id)

    if not user_context:
        return {
            "answer": "User not found.",
            "source": "system",
            "sources": [],
            "meta": {},
        }

    intent = intent_engine.detect_intent(request.message)

    try:
        if intent in {"FIND_BOOTH", "GET_DIRECTIONS"}:
            if not request.district or not request.city:
                return _log_and_return(
                    db,
                    request.user_id,
                    request.message,
                    {
                        "answer": "Please select your district and city so I can find polling booths locally.",
                        "source": "location",
                        "sources": [],
                        "meta": {
                            "required": ["district", "city"],
                            "booths": [],
                        },
                    },
                    intent,
                )

            booths = []
            if request.lat is not None and request.lng is not None:
                booths = get_nearest_booths(
                    db=db,
                    district=request.district,
                    city=request.city,
                    lat=request.lat,
                    lng=request.lng,
                )

            if not booths:
                booths = get_booths(
                    db=db,
                    district=request.district,
                    city=request.city,
                    query=request.message,
                )

            if not booths:
                booths = get_booths(
                    db=db,
                    district=request.district,
                    city=request.city,
                )

            if not booths:
                answer = f"No polling booths found for {request.city}, {request.district}."
            elif intent == "GET_DIRECTIONS":
                answer = "I found matching polling booths. Use the booth address details below for local directions."
            else:
                answer = f"Found {len(booths)} polling booths in {request.city}."

            return _log_and_return(
                db,
                request.user_id,
                request.message,
                {
                    "answer": answer,
                    "source": "location",
                    "sources": [],
                    "meta": {
                        "district": request.district,
                        "city": request.city,
                        "booths": booths,
                    },
                },
                intent,
            )

        result = get_phase3_engine().route(
            query=request.message,
            context=user_context,
            db=db,
        )

    except Exception as exc:
        return {
            "answer": "Something went wrong while processing your request.",
            "source": "error",
            "sources": [],
            "meta": {"error": str(exc)},
        }

    return _log_and_return(
        db,
        request.user_id,
        request.message,
        {
            "answer": result.get("answer"),
            "source": result.get("source"),
            "sources": result.get("sources", []),
            "meta": result.get("meta", {}),
        },
        intent,
    )
