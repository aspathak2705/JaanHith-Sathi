from sqlalchemy import Column, Integer, String
from app.db.session import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    query = Column(String)
    response = Column(String)