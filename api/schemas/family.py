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
