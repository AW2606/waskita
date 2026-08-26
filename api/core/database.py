import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from api.core.config import settings

logger = logging.getLogger("waskita.database")

class Base(DeclarativeBase):
    pass

# Determine database engine with resilience
database_url = settings.DATABASE_URL

try:
    if database_url.startswith("sqlite"):
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
    else:
        # PostgreSQL engine
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info("Connected successfully to PostgreSQL database.")
except Exception as e:
    logger.warning(
        f"PostgreSQL connection to {database_url} failed ({e}). Falling back to local SQLite database for seamless development."
    )
    fallback_url = "sqlite:///./waskita_dev.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
