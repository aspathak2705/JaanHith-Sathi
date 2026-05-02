from app.models.user import User

def create_user(db, data):
    user = User(
        name=data.name,
        email=data.email,
        password=data.password  # (later hash)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db, email, password):
    user = db.query(User).filter(User.email == email).first()
    if user and user.password == password:
        return user
    return None