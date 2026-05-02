from sqlalchemy.orm import Session
from app.models.user import User
from app.models.state import UserState


def get_user_context(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    state = db.query(UserState).filter(UserState.user_id == user_id).first()

    if not user:
        return None

    return {
        "user_id": user.id,
        "age": user.age,
        "location": user.location,
        "is_citizen": user.is_citizen,
        "state": state.state if state else "NEW_USER"
    }