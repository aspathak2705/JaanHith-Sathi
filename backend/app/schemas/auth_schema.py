from pydantic import BaseModel

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    age: int
    location: str
    is_citizen: bool


class LoginRequest(BaseModel):
    email: str
    password: str