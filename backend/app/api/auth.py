from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth_service import create_user, authenticate_user
from app.schemas.auth_schema import RegisterRequest, LoginRequest

router = APIRouter()


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = create_user(db, request)
    return {"user_id": user.id}


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)

    if not user:
        return {"error": "Invalid credentials"}

    return {"user_id": user.id}