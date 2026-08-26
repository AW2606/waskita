import random
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models.verification import Verification
from api.schemas.verification import VerificationResponse

router = APIRouter(prefix="/api/verify", tags=["Verifikasi"])


def generate_simulation_result(content_type: str, text_content: Optional[str] = None, filename: Optional[str] = None):
    """
    Simulates AI detection logic and returns appropriate risk level, score, explanation, and technical details.
    """
    # Random selection with realistic distribution
    risk_options = [
        ("perlu_diperiksa", 52),
        ("tenang", 22),
        ("sangat_waspada", 86),
        ("perlu_diperiksa", 56),
    ]
    chosen_risk, base_score = random.choice(risk_options)
    score = base_score + random.randint(-4, 4)
    score = max(5, min(95, score))

    if chosen_risk == "tenang":
        explanation = (
            "Hasil analisis menunjukkan pola media berada dalam batas wajar dan alami. "
            "Tidak ditemukan indikasi manipulasi sintetis AI atau anomali mencurigakan."
        )
        technical_detail = (
            "• Karakteristik Alami: Terdeteksi desah napas organik dan dinamika intonasi natural.\n"
            "• Spektrum Frekuensi: Distribusi harmonik stabil tanpa distorsi kompresi neural.\n"
            "• Tingkat Keaslian (Confidence): 94.8% terverifikasi alami."
        )
    elif chosen_risk == "perlu_diperiksa":
        explanation = (
            "Kami menemukan pola yang tidak biasa dari data ini (menyerupai sintesis AI). "
            "Ini bukan bukti mutlak penipuan, namun kami menyarankan Anda memverifikasi lebih lanjut dengan pihak terkait."
        )
        technical_detail = (
            "• Artefak Spektral: Terdeteksi diskontinuitas fase frekuensi pada rentang 3.2 kHz - 4.5 kHz.\n"
            "• Variansi Pitch: Tingkat modulasi intonasi terlampau seragam (std dev: 0.12 Hz).\n"
            "• Rekayasa Akustik: Tidak ditemukan respon pantulan ruang (room reverb) fisik alami."
        )
    else:  # sangat_waspada
        explanation = (
            "Indikasi manipulasi sintesis AI atau pola rekayasa sosial terdeteksi sangat kuat. "
            "Sangat disarankan untuk tidak melanjutkan transfer dana atau memberikan data pribadi."
        )
        technical_detail = (
            "• Model Neural Vocoder: Terdeteksi sidik jari generator kloning suara (probabilitas 89.7%).\n"
            "• Pola Urgensi: Analisis semantik teks mendeteksi pola intimidasi/urgensi waktu buatan.\n"
            "• Jejak Kompresi: File tidak memiliki jejak kompresi mikrofon fisik telepon umum."
        )

    return chosen_risk, score, explanation, technical_detail


@router.post("", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
async def create_verification(
    content_type: str = Form(...),
    text_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Submit content for AI verification analysis.
    Supports file uploads (audio/video) or text inputs (messages/phone numbers).
    """
    filename = file.filename if file else None
    risk_level, score, explanation, technical_detail = generate_simulation_result(
        content_type=content_type,
        text_content=text_content,
        filename=filename,
    )

    verification_id = f"wsk_{uuid.uuid4().hex[:8]}"

    new_verification = Verification(
        id=verification_id,
        content_type=content_type,
        risk_level=risk_level,
        score=score,
        explanation=explanation,
        technical_detail=technical_detail,
    )

    db.add(new_verification)
    db.commit()
    db.refresh(new_verification)

    return new_verification


@router.get("/{verification_id}", response_model=VerificationResponse)
def get_verification_by_id(
    verification_id: str,
    db: Session = Depends(get_db),
):
    """
    Get verification details by ID.
    """
    verification = db.query(Verification).filter(Verification.id == verification_id).first()
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hasil verifikasi dengan ID '{verification_id}' tidak ditemukan.",
        )
    return verification
