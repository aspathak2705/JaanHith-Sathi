from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.db.session import get_db
from app.services.user_context import get_user_context
from app.models.document import Document
from app.models.notification_event import NotificationEvent

router = APIRouter()

REQUIRED_DOCUMENTS = [
    {"name": "Government Photo ID", "type": "Identity Proof"},
    {"name": "Address Proof", "type": "Address Proof"},
    {"name": "Passport Size Photo", "type": "Photograph"},
]

def make_notification(notification_id: str, target_path: str, **payload) -> Dict[str, Any]:
    return {
        "id": notification_id,
        "target_path": target_path,
        **payload,
    }

def get_deadline_notification(state: str) -> Dict[str, Any]:
    if state == "ELIGIBILITY_CHECKED":
        return make_notification(
            "registration-deadline",
            "/verification",
            type="deadline",
            title="Registration Deadline Approaching",
            message="You have cleared eligibility. Finish the verification step by uploading your documents.",
            action_text="Open Verification",
            icon="warning",
            color="amber",
            is_urgent=True,
            created_at=datetime.utcnow().isoformat(),
        )
    return None

def get_action_nudge(state: str) -> Dict[str, Any]:
    if state == "NEW_USER":
        return make_notification(
            "complete-eligibility",
            "/chat",
            type="nudge",
            title="Complete Your Eligibility Check",
            message="You haven't checked your voting eligibility yet. Take 2 minutes to verify.",
            action_text="Check Eligibility",
            icon="assignment_late",
            color="blue",
            is_urgent=False,
            created_at=(datetime.utcnow() - timedelta(hours=2)).isoformat(),
        )
    elif state == "REGISTRATION_IN_PROGRESS":
        return make_notification(
            "resume-registration",
            "/chat",
            type="nudge",
            title="Resume Registration",
            message="Your registration is incomplete. Please finish submitting your details.",
            action_text="Continue Registration",
            icon="pending_actions",
            color="blue",
            is_urgent=False,
            created_at=(datetime.utcnow() - timedelta(hours=5)).isoformat(),
        )
    return None

def get_document_reminder(state: str, documents: List[Document]) -> Dict[str, Any]:
    uploaded_types = {doc.document_type for doc in documents}
    missing_documents = [doc for doc in REQUIRED_DOCUMENTS if doc["type"] not in uploaded_types]

    if state in ["ELIGIBILITY_CHECKED", "REGISTERED", "REGISTRATION_IN_PROGRESS"] and missing_documents:
        document_names = ", ".join(doc["name"] for doc in missing_documents[:2])
        suffix = "" if len(missing_documents) <= 2 else " and more"
        return make_notification(
            "verification-documents-missing",
            "/verification",
            type="document",
            title="Verification Documents Needed",
            message=f"Upload {document_names}{suffix} to continue the verification stage.",
            action_text="Upload Documents",
            icon="upload_file",
            color="purple",
            is_urgent=False,
            created_at=(datetime.utcnow() - timedelta(days=1)).isoformat(),
        )
    return None

def get_voting_day_reminder(state: str) -> Dict[str, Any]:
    if state in ["READY", "ACTIVATED"]:
        return make_notification(
            "voting-day-reminder",
            "/location",
            type="event",
            title="Voting Day is Approaching",
            message="Get ready! Polling day is Nov 05, 2024. Prepare your voter slip.",
            action_text="View Booth",
            icon="how_to_vote",
            color="green",
            is_urgent=True,
            created_at=datetime.utcnow().isoformat(),
        )
    return None

def get_verification_unlocked_notification(state: str, documents: List[Document]) -> Dict[str, Any]:
    if state == "ELIGIBILITY_CHECKED":
        return make_notification(
            "verification-stage-ready",
            "/verification",
            type="journey",
            title="Verification Stage Ready",
            message=f"Your next civic stage is verification. Upload the required documents to move ahead. Documents uploaded: {len(documents)}.",
            action_text="View Verification",
            icon="fact_check",
            color="primary",
            is_urgent=False,
            created_at=(datetime.utcnow() - timedelta(minutes=30)).isoformat(),
        )
    return None

def serialize_event(event: NotificationEvent) -> Dict[str, Any]:
    return {
        "id": f"event-{event.id}",
        "target_path": event.target_path,
        "type": event.type,
        "title": event.title,
        "message": event.message,
        "action_text": event.action_text,
        "icon": event.icon,
        "color": event.color,
        "is_urgent": event.is_urgent,
        "created_at": event.created_at.isoformat(),
    }

@router.get("/list/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    context = get_user_context(db, user_id)
    if not context:
        return {"status": "error", "message": "User not found"}
        
    state = context.get("state", "NEW_USER")
    documents = db.query(Document).filter(Document.user_id == user_id).all()
    notifications = []
    events = (
        db.query(NotificationEvent)
        .filter(NotificationEvent.user_id == user_id)
        .order_by(NotificationEvent.created_at.desc())
        .all()
    )
    notifications.extend(serialize_event(event) for event in events)
    
    verification = get_verification_unlocked_notification(state, documents)
    if verification: notifications.append(verification)

    deadline = get_deadline_notification(state)
    if deadline: notifications.append(deadline)
        
    nudge = get_action_nudge(state)
    if nudge: notifications.append(nudge)
        
    doc_reminder = get_document_reminder(state, documents)
    if doc_reminder: notifications.append(doc_reminder)
        
    voting_reminder = get_voting_day_reminder(state)
    if voting_reminder: notifications.append(voting_reminder)
        
    if not events:
        notifications.append(make_notification(
            "welcome",
            "/",
            type="system",
            title="Welcome to Janhith Sathi",
            message="Your civic intelligence platform is ready. We will notify you whenever your next stage opens up.",
            action_text="Start Journey",
            icon="celebration",
            color="primary",
            is_urgent=False,
            created_at=(datetime.utcnow() - timedelta(days=2)).isoformat(),
        ))

    notifications.sort(key=lambda x: (not x["is_urgent"], x["created_at"]))
    seen_ids = set()
    deduped = []
    for item in notifications:
        if item["id"] in seen_ids:
            continue
        seen_ids.add(item["id"])
        deduped.append(item)

    return {"status": "success", "data": deduped}
