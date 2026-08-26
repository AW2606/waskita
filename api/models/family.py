import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from api.core.database import Base


class FamilyLink(Base):
    __tablename__ = "family_links"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    member_name = Column(String(255), nullable=False)
    member_phone = Column(String(50), nullable=False)
    relation = Column(String(100), nullable=True, default="Keluarga")
    status = Column(String(50), nullable=False, default="tenang")  # tenang / perlu_diperiksa / sangat_waspada
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.datetime.utcnow)
