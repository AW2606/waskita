import hashlib
from typing import Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from api.models.community_fingerprint import CommunityFingerprint


def compute_content_hash(data: Union[bytes, str]) -> str:
    """
    Computes a cryptographic SHA-256 digest of input bytes or normalized text.
    Privacy-Preserving: The raw media is never retained, only this 64-char fingerprint.
    """
    hasher = hashlib.sha256()
    if isinstance(data, str):
        hasher.update(data.strip().lower().encode("utf-8"))
    else:
        hasher.update(data)
    return hasher.hexdigest()


def lookup_fingerprint(db: Session, hash_id: str) -> Optional[Dict[str, Any]]:
    """
    Checks if a media/content hash is already registered in the community fingerprint database.
    If found, increments hit_count and returns the cached verification result.
    """
    record = db.query(CommunityFingerprint).filter(CommunityFingerprint.id == hash_id).first()
    if not record:
        return None

    # Increment hit count to track viral spread
    try:
        record.hit_count += 1
        db.commit()
    except Exception:
        db.rollback()

    return {
        "is_cached": True,
        "hash_id": record.id,
        "content_type": record.content_type,
        "risk_level": record.risk_level,
        "score": record.score,
        "explanation": record.explanation,
        "technical_detail": record.technical_detail,
        "hit_count": record.hit_count,
        "community_trust_score": (
            round((record.user_feedback_positive / max(1, record.user_feedback_positive + record.user_feedback_negative)) * 100)
            if (record.user_feedback_positive + record.user_feedback_negative) > 0
            else 100
        ),
        "is_verified_by_moderator": record.is_verified_by_moderator,
    }


def register_fingerprint(
    db: Session,
    hash_id: str,
    content_type: str,
    risk_level: str,
    score: int,
    explanation: str,
    technical_detail: Optional[str] = None,
) -> CommunityFingerprint:
    """
    Registers a new verification fingerprint into the community database.
    """
    existing = db.query(CommunityFingerprint).filter(CommunityFingerprint.id == hash_id).first()
    if existing:
        existing.hit_count += 1
        db.commit()
        return existing

    new_fp = CommunityFingerprint(
        id=hash_id,
        content_type=content_type,
        risk_level=risk_level,
        score=score,
        explanation=explanation,
        technical_detail=technical_detail,
        hit_count=1,
        confirmed_fraud_count=1 if risk_level == "sangat_waspada" else 0,
    )
    db.add(new_fp)
    db.commit()
    db.refresh(new_fp)
    return new_fp


def record_community_feedback(
    db: Session,
    hash_id: str,
    is_positive: bool,
) -> bool:
    """
    Records human-in-the-loop validation feedback for accuracy tracking.
    """
    record = db.query(CommunityFingerprint).filter(CommunityFingerprint.id == hash_id).first()
    if not record:
        return False

    if is_positive:
        record.user_feedback_positive += 1
    else:
        record.user_feedback_negative += 1

    db.commit()
    return True
