import datetime
import uuid
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from api.core.database import Base


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4())[:8], index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content_type = Column(String(50), nullable=False)  # audio / video / text / phone_number / suara / pesan
    risk_level = Column(String(50), nullable=False)    # tenang / perlu_diperiksa / sangat_waspada
    score = Column(Integer, default=50)                # 0 to 100 for gauge position
    explanation = Column(Text, nullable=False)
    technical_detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.datetime.utcnow)
