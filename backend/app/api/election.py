from fastapi import APIRouter
from app.services.state_machine import StateMachine

router = APIRouter()
sm = StateMachine()

@router.get("/next-state")
def next_state(current_state: str):
    return {
        "next_state": sm.get_next_state(current_state)
    }