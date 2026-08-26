import datetime
from typing import Optional
from pydantic import BaseModel


class VerificationCreate(BaseModel):
    content_type: str
    text_content: Optional[str] = None


class VerificationResponse(BaseModel):
    id: str
    user_id: Optional[int] = None
    content_type: str
    risk_level: str  # tenang / perlu_diperiksa / sangat_waspada
    score: int       # 0 - 100
    explanation: str
    technical_detail: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
