import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings
from api.core.database import init_db, SessionLocal
from api.models.reported_number import ReportedNumber
from api.services.ml_models import get_model_manager
from api.routers import verify, family


def seed_reported_numbers():
    """Seed initial fraudulent/suspicious phone numbers for heuristic matching."""
    db = SessionLocal()
    try:
        if db.query(ReportedNumber).count() == 0:
            sample_numbers = [
                ReportedNumber(
                    phone_number="+6282199887766",
                    report_count=18,
                    category="Penipuan Catut Nama Atasan / Kloning Suara",
                ),
                ReportedNumber(
                    phone_number="081234567890",
                    report_count=7,
                    category="Permintaan Kode OTP & Rekening Kas Darurat",
                ),
                ReportedNumber(
                    phone_number="+6285711223344",
                    report_count=24,
                    category="Pinjaman Online Ilegal & Teror Kontak",
                ),
                ReportedNumber(
                    phone_number="085612345678",
                    report_count=12,
                    category="Kloning Suara Anak Menangis Minta Tebusan",
                ),
            ]
            db.add_all(sample_numbers)
            db.commit()
    except Exception as e:
        print("Reported numbers seed notice:", e)
    finally:
        db.close()


# Ensure tables and seed are ready immediately
try:
    init_db()
    seed_reported_numbers()
except Exception as e:
    print("Initial DB setup notice:", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database tables
    try:
        init_db()
        seed_reported_numbers()
    except Exception as e:
        print("Lifespan DB setup notice:", e)

    # 2. Preload AI models in background so startup remains snappy
    asyncio.create_task(asyncio.to_thread(get_model_manager().load_models))

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(verify.router)
app.include_router(family.router)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }
