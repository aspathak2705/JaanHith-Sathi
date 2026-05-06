from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from app.db.session import Base
from datetime import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    document_type = Column(String, index=True) # e.g. Aadhaar, VoterID
    extracted_text = Column(String)
    is_valid = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
