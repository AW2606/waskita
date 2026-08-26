import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from api.core.database import Base


class ReportedNumber(Base):
    __tablename__ = "reported_numbers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone_number = Column(String(100), unique=True, index=True, nullable=False)
    report_count = Column(Integer, default=1, nullable=False)
    category = Column(String(255), default="Indikasi Penipuan AI / Catut Nama", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.datetime.utcnow)
