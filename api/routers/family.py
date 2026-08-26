from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models.family import FamilyLink
from api.schemas.family import FamilyMemberCreate, FamilyMemberResponse

router = APIRouter(prefix="/api/family", tags=["Pendamping Keluarga"])


@router.post("", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
def add_family_member(
    member_data: FamilyMemberCreate,
    db: Session = Depends(get_db),
):
    """
    Add a new family member to the protection list.
    """
    new_member = FamilyLink(
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
    db: Session = Depends(get_db),
):
    """
    Get all registered family members.
    """
    members = db.query(FamilyLink).order_by(FamilyLink.created_at.desc()).all()
    
    # If empty initially, seed with 2 friendly sample members for great experience
    if not members:
        seed1 = FamilyLink(
            member_name="Ibu Siti Aminah",
            member_phone="+62 812-3456-7890",
            relation="Ibu",
            status="tenang",
        )
        seed2 = FamilyLink(
            member_name="Bapak Rahmad Subagio",
            member_phone="+62 813-9876-5432",
            relation="Ayah",
            status="tenang",
        )
        db.add_all([seed1, seed2])
        db.commit()
        members = db.query(FamilyLink).order_by(FamilyLink.created_at.desc()).all()

    return members
