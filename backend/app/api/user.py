from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.state import UserState
from app.services.rule_engine import RuleEngine

router = APIRouter()

@router.post("/create")
def create_user(name: str, age: int, location: str, db: Session = Depends(get_db)):

    user = User(name=name, age=age, location=location)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize state
    user_state = UserState(user_id=user.id, state="NEW_USER")
    db.add(user_state)
    db.commit()

    return {
        "user_id": user.id,
        "message": "User created successfully"
    }


@router.get("/eligibility/{user_id}")
def check_eligibility(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"error": "User not found"}

    return RuleEngine.check_eligibility(user.age)