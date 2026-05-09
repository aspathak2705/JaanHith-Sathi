from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.session import Base


class NotificationEvent(Base):
    __tablename__ = "notification_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    event_key = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    action_text = Column(String, nullable=True)
    target_path = Column(String, nullable=False, default="/notifications")
    icon = Column(String, nullable=False, default="notifications")
    color = Column(String, nullable=False, default="primary")
    is_urgent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
