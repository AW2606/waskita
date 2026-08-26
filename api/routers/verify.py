import os
import uuid
import tempfile
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models.verification import Verification
from api.models.user import User
from api.schemas.verification import VerificationResponse
from api.services.ml_models import get_model_manager
from api.services.heuristic_scanner import scan_text, scan_phone
from api.services.risk_translator import translate_risk
from api.routers.auth import get_current_user

router = APIRouter(prefix="/api/verify", tags=["Verifikasi"])


@router.post("", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
async def create_verification(
    content_type: str = Form(...),
    text_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits content for real AI and Heuristic verification analysis.
    - Zero Permanent Media Retention Policy: Uploaded audio/video files are only processed
      in memory/temporary storage and explicitly purged immediately in the finally block.
    - All verifications are linked strictly to the authenticated user (current_user.id).
    """
    clean_type = content_type.lower().strip()
    file_bytes = None
    filename = None
    temp_file_path = None

    try:
        if file is not None:
            filename = file.filename
            file_bytes = await file.read()

        model_mgr = get_model_manager()

        # -------------------------------------------------------------------------
        # Track 1: Audio / Voice Verification (Wav2Vec2 Deepfake AI Model)
        # -------------------------------------------------------------------------
        if clean_type in ["suara", "audio"]:
            if not file_bytes and text_content:
                raw_score, meta = scan_text(text_content)
                result = translate_risk(raw_score, "audio", meta)
            else:
                raw_score, meta = model_mgr.predict_audio(file_bytes, filename)
                if raw_score is None:
                    result = {
                        "risk_level": "perlu_diperiksa",
                        "score": 50,
                        "explanation": (
                            "Kami tidak dapat memeriksa rekaman suara ini dengan yakin karena format atau kualitas audio "
                            "tidak terbaca secara optimal. Sebaiknya lakukan verifikasi manual langsung dengan pihak terkait "
                            "melalui saluran komunikasi resmi."
                        ),
                        "technical_detail": (
                            "• Status: Gagal memproses file audio.\n"
                            f"• Keterangan Sistem: {meta.get('error', 'Format tidak didukung.')}\n"
                            "• Kebijakan Privasi: File audio telah dihapus seketika dari memori server (Zero Retention)."
                        ),
                    }
                else:
                    result = translate_risk(raw_score, "audio", meta)

        # -------------------------------------------------------------------------
        # Track 1: Video Verification (Vision Transformer ViT 5-Frame Sampled AI Model)
        # -------------------------------------------------------------------------
        elif clean_type in ["video"]:
            if not file_bytes and text_content:
                raw_score, meta = scan_text(text_content)
                result = translate_risk(raw_score, "video", meta)
            else:
                raw_score, meta = model_mgr.predict_video(file_bytes, filename)
                if raw_score is None:
                    result = {
                        "risk_level": "perlu_diperiksa",
                        "score": 50,
                        "explanation": (
                            "Kami tidak dapat mengekstraksi dan memeriksa frame video ini dengan yakin. "
                            "Format media mungkin mengalami gangguan atau kompresi berlebih. "
                            "Sebaiknya lakukan verifikasi manual langsung dengan pihak yang bersangkutan."
                        ),
                        "technical_detail": (
                            "• Status: Gagal memproses frame video.\n"
                            f"• Keterangan Sistem: {meta.get('error', 'Format video tidak terbaca.')}\n"
                            "• Kebijakan Privasi: File video telah dihapus seketika dari memori server (Zero Retention)."
                        ),
                    }
                else:
                    result = translate_risk(raw_score, "video", meta)

        # -------------------------------------------------------------------------
        # Track 2: Text / Chat Message Verification (Indonesian Heuristic Scanner)
        # -------------------------------------------------------------------------
        elif clean_type in ["pesan", "text"]:
            text_to_scan = text_content or (file_bytes.decode("utf-8", errors="ignore") if file_bytes else "")
            raw_score, meta = scan_text(text_to_scan)
            result = translate_risk(raw_score, "pesan", meta)

        # -------------------------------------------------------------------------
        # Track 2: Phone Number Verification (Reported Numbers Registry)
        # -------------------------------------------------------------------------
        elif clean_type in ["telepon", "phone_number"]:
            phone_to_scan = text_content or (file_bytes.decode("utf-8", errors="ignore") if file_bytes else "")
            raw_score, meta = scan_phone(phone_to_scan, db)
            result = translate_risk(raw_score, "telepon", meta)

        else:
            raw_score, meta = scan_text(text_content or "")
            result = translate_risk(raw_score, "pesan", meta)

        # Append Zero-Retention Privacy Note to technical details
        tech_detail = result["technical_detail"] or ""
        if "Zero-Retention" not in tech_detail:
            tech_detail += "\n• Privasi & Retensi: File media mentah tidak disimpan permanen dan telah dihapus otomatis (Zero Retention Policy)."

        # Persist Analysis Results in Database (Without media bytes)
        verification_id = f"wsk_{uuid.uuid4().hex[:8]}"

        new_verification = Verification(
            id=verification_id,
            user_id=current_user.id,
            content_type=clean_type,
            risk_level=result["risk_level"],
            score=result["score"],
            explanation=result["explanation"],
            technical_detail=tech_detail,
        )

        db.add(new_verification)
        db.commit()
        db.refresh(new_verification)

        return new_verification

    finally:
        # Strict Zero-Retention Cleanup: Purge memory buffers and temp files
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
        if file_bytes is not None:
            del file_bytes


@router.get("/{verification_id}", response_model=VerificationResponse)
def get_verification_by_id(
    verification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get verification details by ID. Strictly limited to the owner (current_user.id).
    """
    verification = db.query(Verification).filter(Verification.id == verification_id).first()
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hasil verifikasi dengan ID '{verification_id}' tidak ditemukan.",
        )

    # Enforce ownership: only the user who created it can view it
    if verification.user_id is not None and verification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki izin untuk mengakses hasil verifikasi ini.",
        )

    return verification
