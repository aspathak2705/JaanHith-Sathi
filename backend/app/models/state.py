from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.session import Base

class UserState(Base):
    __tablename__ = "user_states"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    state = Column(String, default="NEW_USER")