import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.security import hash_password, verify_password
from api.models.family import FamilyLink
from api.models.user import User
from api.schemas.family import (
    FamilyMemberCreate,
    FamilyMemberResponse,
    SafeWordUpdate,
    SafeWordStatusResponse,
    SafeWordVerifyRequest,
    SafeWordVerifyResponse,
)
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


def _get_safeword_status(current_user: User) -> SafeWordStatusResponse:
    return SafeWordStatusResponse(
        has_safe_word=bool(current_user.safe_word),
        has_duress_code=bool(current_user.duress_code),
        safe_word_updated_at=current_user.safe_word_updated_at,
    )


@router.get("/safeword", response_model=SafeWordStatusResponse)
@router.get("/safe-word", response_model=SafeWordStatusResponse)
def get_family_safe_word_status(
    current_user: User = Depends(get_current_user),
):
    """
    Returns only the configuration status and update timestamp.
    Zero-Leakage: Plaintext secret codes and raw hashes are NEVER exposed to the frontend.
    """
    return _get_safeword_status(current_user)


@router.post("/safeword", response_model=SafeWordStatusResponse)
@router.post("/safe-word", response_model=SafeWordStatusResponse)
def update_family_safe_word(
    data: SafeWordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Hashes and securely saves the Family Safe Word and optional Duress Code using bcrypt.
    Plaintext secrets are hashed on the server and never returned in the response.
    """
    clean_word = data.safe_word.strip().lower()
    if not clean_word:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi aman tidak boleh kosong.",
        )

    current_user.safe_word = hash_password(clean_word)
    
    if data.duress_code and data.duress_code.strip():
        current_user.duress_code = hash_password(data.duress_code.strip().lower())
    else:
        current_user.duress_code = None

    current_user.safe_word_updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    return _get_safeword_status(current_user)


@router.post("/safeword/verify", response_model=SafeWordVerifyResponse)
@router.post("/safe-word/verify", response_model=SafeWordVerifyResponse)
def verify_family_safe_word(
    data: SafeWordVerifyRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Verifies an input code against the user's stored bcrypt hashes.
    Returns only true/false match status and matched category, never leaking the stored secret.
    """
    candidate = data.code.strip().lower()
    if not candidate:
        return SafeWordVerifyResponse(
            is_match=False,
            matched_type=None,
            message="Kode verifikasi tidak boleh kosong.",
        )

    # Check Safe Word
    if current_user.safe_word and verify_password(candidate, current_user.safe_word):
        return SafeWordVerifyResponse(
            is_match=True,
            matched_type="safe_word",
            message="Kata Sandi Aman Utama cocok dan terverifikasi sah!",
        )

    # Check Duress Code
    if current_user.duress_code and verify_password(candidate, current_user.duress_code):
        return SafeWordVerifyResponse(
            is_match=True,
            matched_type="duress_code",
            message="Peringatan: Kode Darurat Sandera terdeteksi! Anggota keluarga memberi sinyal bahaya.",
        )

    return SafeWordVerifyResponse(
        is_match=False,
        matched_type=None,
        message="Kata sandi atau kode darurat tidak cocok.",
    )
