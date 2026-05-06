from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.session import Base
from datetime import datetime

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    action = Column(String, index=True)
    metadata_data = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
