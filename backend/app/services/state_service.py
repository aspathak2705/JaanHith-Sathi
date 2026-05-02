from sqlalchemy.orm import Session
from app.models.state import UserState

# VALID STATE TRANSITIONS
VALID_TRANSITIONS = {
    "NEW_USER": ["ELIGIBILITY_CHECKED"],
    "ELIGIBILITY_CHECKED": ["REGISTERED"],
    "REGISTERED": ["READY_TO_VOTE"],
    "READY_TO_VOTE": []
}


def update_user_state(db: Session, user_id: int, new_state: str):
    state = db.query(UserState).filter(UserState.user_id == user_id).first()

    # If no state exists → initialize
    if not state:
        state = UserState(user_id=user_id, state="NEW_USER")
        db.add(state)
        db.commit()
        db.refresh(state)

    current_state = state.state

    #  VALIDATION CHECK
    allowed_next_states = VALID_TRANSITIONS.get(current_state, [])

    if new_state not in allowed_next_states:
        print(f" Invalid transition: {current_state} → {new_state}")
        return current_state  #  reject invalid transition

    #  VALID TRANSITION → UPDATE
    state.state = new_state
    db.commit()
    db.refresh(state)

    print(f" State updated: {current_state} → {new_state}")

    return state.state