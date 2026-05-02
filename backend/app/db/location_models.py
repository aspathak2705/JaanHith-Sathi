from sqlalchemy import Column, Integer, String, Float
from app.db.base import Base


class Booth(Base):
    __tablename__ = "booths"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    city = Column(String, index=True)

    booth_name = Column(String)
    building = Column(String)
    area = Column(String)
    room = Column(String)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)