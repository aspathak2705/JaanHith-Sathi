from sqlalchemy.orm import Session

from app.models.state import UserState
from app.services.notification_service import create_notification_event


VALID_TRANSITIONS = {
    "NEW_USER": ["ELIGIBILITY_CHECKED"],
    "ELIGIBILITY_CHECKED": ["VERIFICATION_CHECKED"],
    "VERIFICATION_CHECKED": ["REGISTERED"],
    "REGISTERED": ["READY_TO_VOTE"],
    "READY_TO_VOTE": [],
}

STATE_NOTIFICATION_CONFIG = {
    "ELIGIBILITY_CHECKED": {
        "event_key": "state-eligibility-checked",
        "type": "journey",
        "title": "Eligibility Checked",
        "message": "Eligibility stage complete. Next stage is verification. Upload and verify required documents.",
        "action_text": "Open Verification",
        "target_path": "/verification",
        "icon": "task_alt",
        "color": "blue",
        "is_urgent": False,
    },
    "VERIFICATION_CHECKED": {
        "event_key": "state-verification-checked",
        "type": "journey",
        "title": "Verification Checked",
        "message": "All required documents verified. Civic status moved to verification checked.",
        "action_text": "View Home",
        "target_path": "/",
        "icon": "verified",
        "color": "green",
        "is_urgent": False,
    },
    "REGISTERED": {
        "event_key": "state-registered",
        "type": "journey",
        "title": "Registration In Progress",
        "message": "Registration stage unlocked. Continue next civic step.",
        "action_text": "Open Chat",
        "target_path": "/chat",
        "icon": "edit_document",
        "color": "primary",
        "is_urgent": False,
    },
    "READY_TO_VOTE": {
        "event_key": "state-ready-to-vote",
        "type": "journey",
        "title": "Ready To Vote",
        "message": "All civic stages complete. You are ready for voting day.",
        "action_text": "View Booth",
        "target_path": "/location",
        "icon": "how_to_vote",
        "color": "green",
        "is_urgent": True,
    },
}


def update_user_state(db: Session, user_id: int, new_state: str):
    state = db.query(UserState).filter(UserState.user_id == user_id).first()

    if not state:
        state = UserState(user_id=user_id, state="NEW_USER")
        db.add(state)
        db.commit()
        db.refresh(state)

    current_state = state.state

    if current_state == new_state:
        return state.state

    if new_state not in VALID_TRANSITIONS.get(current_state, []):
        return current_state

    state.state = new_state
    db.commit()
    db.refresh(state)

    notification_config = STATE_NOTIFICATION_CONFIG.get(new_state)
    if notification_config:
        create_notification_event(
            db,
            user_id=user_id,
            replace_existing=True,
            **notification_config,
        )

    return state.state
