from sqlalchemy import Column, Integer, String
from app.core.database import Base

class UserState(Base):
    __tablename__ = "user_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    state = Column(String)