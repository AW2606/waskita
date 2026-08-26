import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from api.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False, default="")
    
    # Family Defense: Primary Safe Word & Secondary Duress Code
    safe_word = Column(String(100), nullable=True, default=None)
    duress_code = Column(String(100), nullable=True, default=None)
    safe_word_updated_at = Column(DateTime, nullable=True, default=None)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.datetime.utcnow)
