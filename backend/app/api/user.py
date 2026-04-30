from fastapi import APIRouter
from app.services.rule_engine import RuleEngine

router = APIRouter()

@router.post("/create")
def create_user(name: str, age: int, location: str):
    return {
        "name": name,
        "age": age,
        "location": location
    }

@router.get("/eligibility")
def check_eligibility(age: int):
    return RuleEngine.check_eligibility(age)