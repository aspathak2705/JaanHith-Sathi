from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.state import UserState
from app.services.state_machine import StateMachine

router = APIRouter()
sm = StateMachine()

@router.post("/next-state/{user_id}")
def next_state(user_id: int, db: Session = Depends(get_db)):

    user_state = db.query(UserState).filter(UserState.user_id == user_id).first()

    if not user_state:
        return {"error": "User state not found"}

    next_state = sm.get_next_state(user_state.state)
    user_state.state = next_state

    db.commit()

    return {
        "user_id": user_id,
        "new_state": next_state
    }