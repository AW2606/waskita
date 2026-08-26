from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models.family import FamilyLink
from api.models.user import User
from api.schemas.family import FamilyMemberCreate, FamilyMemberResponse
from api.routers.auth import get_current_user

router = APIRouter(prefix="/api/family", tags=["Pendamping Keluarga"])


@router.post("", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
def add_family_member(
    member_data: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add a new family member linked strictly to the authenticated user.
    """
    new_member = FamilyLink(
        user_id=current_user.id,
        member_name=member_data.member_name.strip(),
        member_phone=member_data.member_phone.strip(),
        relation=member_data.relation or "Keluarga",
        status="tenang",
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.get("", response_model=List[FamilyMemberResponse])
def get_all_family_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get registered family members belonging strictly to the authenticated user.
    """
    members = (
        db.query(FamilyLink)
        .filter(FamilyLink.user_id == current_user.id)
        .order_by(FamilyLink.created_at.desc())
        .all()
    )
    return members
