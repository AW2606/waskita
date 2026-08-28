from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models.reported_number import ReportedNumber
from api.models.number_report import NumberReport
from api.models.user import User
from api.routers.auth import get_current_user

router = APIRouter(prefix="/api/report-number", tags=["Laporan Nomor"])


class ReportNumberRequest(BaseModel):
    phone_number: str = Field(..., min_length=5, max_length=50, description="Nomor telepon yang dilaporkan")
    reason: str = Field(..., min_length=5, max_length=500, description="Alasan singkat pelaporan")


class ReportNumberResponse(BaseModel):
    status: str
    message: str
    phone_number: str
    report_count: int


class ReportCountResponse(BaseModel):
    phone_number: str
    report_count: int


def _normalize_phone(phone: str) -> str:
    """Normalize phone number for consistent matching."""
    return phone.strip().replace(" ", "").replace("-", "")


@router.post("", response_model=ReportNumberResponse, status_code=status.HTTP_201_CREATED)
def report_number(
    payload: ReportNumberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Report a phone number as suspicious. Requires authentication.
    - Creates individual report record (with reason, linked to user_id for internal tracking only)
    - Increments aggregate report_count in reported_numbers (upserts if new)
    - Privacy: user identity is never exposed to other users
    """
    normalized = _normalize_phone(payload.phone_number)
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nomor telepon tidak valid.",
        )

    # Check if this user already reported this exact number (prevent spam)
    existing_report = (
        db.query(NumberReport)
        .filter(
            NumberReport.user_id == current_user.id,
            NumberReport.phone_number == normalized,
        )
        .first()
    )
    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Anda sudah pernah melaporkan nomor ini sebelumnya.",
        )

    # 1. Save individual report (privacy-preserving: user_id stored but never exposed)
    new_report = NumberReport(
        user_id=current_user.id,
        phone_number=normalized,
        reason=payload.reason.strip(),
    )
    db.add(new_report)

    # 2. Upsert aggregate reported_numbers entry
    reported = db.query(ReportedNumber).filter(ReportedNumber.phone_number == normalized).first()
    if reported:
        reported.report_count = (reported.report_count or 0) + 1
    else:
        reported = ReportedNumber(
            phone_number=normalized,
            report_count=1,
            category="Laporan Pengguna",
        )
        db.add(reported)

    db.commit()
    db.refresh(reported)

    return ReportNumberResponse(
        status="success",
        message="Terima kasih! Laporan Anda telah berhasil dicatat dan membantu melindungi komunitas.",
        phone_number=normalized,
        report_count=reported.report_count,
    )


@router.get("/{phone_number}", response_model=ReportCountResponse)
def get_report_count(
    phone_number: str,
    db: Session = Depends(get_db),
):
    """
    Get the community report count for a phone number.
    Privacy-preserving: returns only count, never who reported it.
    """
    normalized = _normalize_phone(phone_number)

    reported = db.query(ReportedNumber).filter(ReportedNumber.phone_number == normalized).first()
    count = reported.report_count if reported else 0

    return ReportCountResponse(
        phone_number=normalized,
        report_count=count,
    )
