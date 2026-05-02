from app.models.user import User
import hashlib

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(db, data):
    existing = db.query(User).filter(User.email == data.email).first()
    
    if existing:
        return None

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        age=data.age,
        location=data.location,
        is_citizen=data.is_citizen
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db, email, password):
    user = db.query(User).filter(User.email == email).first()

    if user and user.password == hash_password(password):
        return user

    return None