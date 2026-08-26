import datetime
from typing import Optional
from pydantic import BaseModel


class FamilyMemberCreate(BaseModel):
    member_name: str
    member_phone: str
    relation: Optional[str] = "Keluarga"


class FamilyMemberResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    member_name: str
    member_phone: str
    relation: Optional[str] = "Keluarga"
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class SafeWordUpdate(BaseModel):
    safe_word: str
    duress_code: Optional[str] = None


class SafeWordStatusResponse(BaseModel):
    has_safe_word: bool
    has_duress_code: bool
    safe_word_updated_at: Optional[datetime.datetime] = None


class SafeWordVerifyRequest(BaseModel):
    code: str


class SafeWordVerifyResponse(BaseModel):
    is_match: bool
    matched_type: Optional[str] = None  # "safe_word", "duress_code", or None
    message: str
