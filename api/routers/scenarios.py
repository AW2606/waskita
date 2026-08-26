import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import redis
from api.core.config import settings
from api.core.database import get_db
from api.models.scenario import Scenario
from api.schemas.scenario import (
    ScenarioSummary,
    ScenarioDetail,
    ScenarioAnswerRequest,
    ScenarioAnswerResponse,
)

logger = logging.getLogger("waskita.scenarios")
router = APIRouter(prefix="/api/scenarios", tags=["Simulasi & Edukasi"])

# Redis Client connection helper
_redis_client = None


def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
            )
            _redis_client.ping()
        except Exception as e:
            logger.warning(f"Redis not available ({e}). Running with in-process fallback.")
            _redis_client = False
    return _redis_client if _redis_client is not False else None


@router.get("", response_model=List[ScenarioSummary])
def get_all_scenarios(
    db: Session = Depends(get_db),
):
    """
    Get summary list of all available scenarios with Redis caching (5 minutes TTL).
    """
    cache_key = "waskita:scenarios:list"
    r = get_redis()

    # 1. Try reading from Redis Cache
    if r:
        try:
            cached_data = r.get(cache_key)
            if cached_data:
                parsed = json.loads(cached_data)
                return [ScenarioSummary(**item) for item in parsed]
        except Exception as e:
            logger.warning(f"Redis cache read error: {e}")

    # 2. Database query on cache miss
    scenarios = db.query(Scenario).order_by(Scenario.id.asc()).all()
    result = [ScenarioSummary.model_validate(s) for s in scenarios]

    # 3. Store in Redis Cache (TTL: 300 seconds / 5 minutes)
    if r:
        try:
            serialized = json.dumps([item.model_dump() for item in result])
            r.setex(cache_key, 300, serialized)
        except Exception as e:
            logger.warning(f"Redis cache write error: {e}")

    return result


@router.get("/{scenario_id}", response_model=ScenarioDetail)
def get_scenario_detail(
    scenario_id: int,
    db: Session = Depends(get_db),
):
    """
    Get full scenario detail (narrative and choices) without exposing the correct answer.
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skenario dengan ID '{scenario_id}' tidak ditemukan.",
        )
    return scenario


@router.post("/{scenario_id}/answer", response_model=ScenarioAnswerResponse)
def answer_scenario(
    scenario_id: int,
    payload: ScenarioAnswerRequest,
    db: Session = Depends(get_db),
):
    """
    Submit answer choice ('a' or 'b') for a scenario and receive educational feedback.
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skenario dengan ID '{scenario_id}' tidak ditemukan.",
        )

    user_choice = payload.choice.strip().lower()
    correct_choice = scenario.correct_choice.strip().lower()
    is_correct = (user_choice == correct_choice)

    return ScenarioAnswerResponse(
        scenario_id=scenario.id,
        selected_choice=user_choice,
        is_correct=is_correct,
        correct_choice=correct_choice,
        explanation=scenario.explanation,
    )
