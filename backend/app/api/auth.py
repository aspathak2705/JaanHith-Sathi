from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.services.auth_service import create_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = create_user(db, request)

    if not user:
        return {"error": "User already exists"}

    return {
    "success": True,
    "message": "User registered successfully",
    "data": {
        "user_id": user.id
    }
    }


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)

    if not user:
        return {"error": "Invalid credentials"}

    return {
    "success": True,
    "message": "Login successful",
    "data": {
        "user_id": user.id
    }
    }