import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from api.core.database import Base


class CommunityFingerprint(Base):
    __tablename__ = "community_fingerprints"

    # SHA-256 hex digest of the content (audio/video bytes or normalized text)
    id = Column(String(64), primary_key=True, index=True)
    content_type = Column(String(30), nullable=False, index=True) # suara, video, pesan, telepon
    risk_level = Column(String(30), nullable=False) # tenang, perlu_diperiksa, sangat_waspada
    score = Column(Integer, nullable=False) # 0 - 100
    explanation = Column(Text, nullable=False)
    technical_detail = Column(Text, nullable=True)
    
    # Community network stats (Zero-Retention: only hash & stats are stored)
    hit_count = Column(Integer, default=1, nullable=False)
    confirmed_fraud_count = Column(Integer, default=0, nullable=False)
    user_feedback_positive = Column(Integer, default=0, nullable=False) # "Akurat / Membantu"
    user_feedback_negative = Column(Integer, default=0, nullable=False) # "Perlu Koreksi"
    is_verified_by_moderator = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )
