from sqlalchemy import Column, Integer, String, Boolean
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    location = Column(String)
    is_citizen = Column(Boolean, default=True)
    from sqlalchemy import Column, Integer, String, Boolean
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)