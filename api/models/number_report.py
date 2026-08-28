import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from api.core.database import Base


class NumberReport(Base):
    """Individual user report for a suspicious phone number.
    Privacy-preserving: only stores user_id internally, never exposed to other users.
    """
    __tablename__ = "number_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phone_number = Column(String(50), index=True, nullable=False)
    reason = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.datetime.utcnow)
