import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from api.core.database import Base


class FamilyLink(Base):
    __tablename__ = "family_links"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    member_name = Column(String(255), nullable=False)
    member_phone = Column(String(100), nullable=False)
    relation = Column(String(100), default="Keluarga")
    status = Column(String(50), default="tenang")  # tenang / perlu_diperiksa / sangat_waspada
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.datetime.utcnow)
