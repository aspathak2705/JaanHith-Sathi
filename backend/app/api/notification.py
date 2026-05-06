from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.db.session import get_db
from app.services.user_context import get_user_context

router = APIRouter()

def get_deadline_notification(state: str) -> Dict[str, Any]:
    if state == "ELIGIBILITY_CHECKED":
        return {
            "type": "deadline",
            "title": "Registration Deadline Approaching",
            "message": "Last date to register is tomorrow. Please complete your registration.",
            "action_text": "Register Now",
            "icon": "warning",
            "color": "amber",
            "is_urgent": True,
            "created_at": datetime.utcnow().isoformat()
        }
    return None

def get_action_nudge(state: str) -> Dict[str, Any]:
    if state == "VERIFIED" or state == "NEW_USER":
        return {
            "type": "nudge",
            "title": "Complete Your Eligibility Check",
            "message": "You haven't checked your voting eligibility yet. Take 2 minutes to verify.",
            "action_text": "Check Eligibility",
            "icon": "assignment_late",
            "color": "blue",
            "is_urgent": False,
            "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat()
        }
    elif state == "REGISTRATION_IN_PROGRESS":
        return {
            "type": "nudge",
            "title": "Resume Registration",
            "message": "Your registration is incomplete. Please finish submitting your details.",
            "action_text": "Continue Registration",
            "icon": "pending_actions",
            "color": "blue",
            "is_urgent": False,
            "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
        }
    return None

def get_document_reminder(state: str) -> Dict[str, Any]:
    if state in ["VERIFIED", "ELIGIBILITY_CHECKED", "REGISTRATION_IN_PROGRESS"]:
        return {
            "type": "document",
            "title": "Missing ID Proof",
            "message": "Upload your valid ID proof to speed up the verification process.",
            "action_text": "Upload ID",
            "icon": "upload_file",
            "color": "purple",
            "is_urgent": False,
            "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
        }
    return None

def get_voting_day_reminder(state: str) -> Dict[str, Any]:
    if state in ["READY", "ACTIVATED"]:
        return {
            "type": "event",
            "title": "Voting Day is Approaching",
            "message": "Get ready! Polling day is Nov 05, 2024. Prepare your voter slip.",
            "action_text": "View Booth",
            "icon": "how_to_vote",
            "color": "green",
            "is_urgent": True,
            "created_at": datetime.utcnow().isoformat()
        }
    return None

@router.get("/list/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    context = get_user_context(db, user_id)
    if not context:
        return {"status": "error", "message": "User not found"}
        
    state = context.get("state", "NEW_USER")
    notifications = []
    
    # 1. Deadline Reminders
    deadline = get_deadline_notification(state)
    if deadline: notifications.append(deadline)
        
    # 2. Action Nudges
    nudge = get_action_nudge(state)
    if nudge: notifications.append(nudge)
        
    # 3. Document Reminders
    doc_reminder = get_document_reminder(state)
    if doc_reminder: notifications.append(doc_reminder)
        
    # 4. Voting Day Reminders
    voting_reminder = get_voting_day_reminder(state)
    if voting_reminder: notifications.append(voting_reminder)
        
    # Add a welcome/system notification for everyone
    notifications.append({
        "type": "system",
        "title": "Welcome to Janhith Sathi",
        "message": "Your civic intelligence platform is ready. Start by checking your eligibility.",
        "action_text": "Start Journey",
        "icon": "celebration",
        "color": "primary",
        "is_urgent": False,
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
    })
    
    # Sort by urgency and then time
    notifications.sort(key=lambda x: (not x["is_urgent"], x["created_at"]))
    
    return {"status": "success", "data": notifications}
