import logging
from sqlalchemy import create_engine, text, inspect
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
    """Create tables and apply schema updates if needed."""
    Base.metadata.create_all(bind=engine)
    
    # Safe schema migration for users columns
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "users" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("users")]
                
                if "password_hash" not in columns:
                    logger.info("Migrating schema: Adding password_hash to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT ''"))
                    conn.commit()

                if "safe_word" not in columns:
                    logger.info("Migrating schema: Adding safe_word to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN safe_word VARCHAR(100) DEFAULT NULL"))
                    conn.commit()

                if "duress_code" not in columns:
                    logger.info("Migrating schema: Adding duress_code to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN duress_code VARCHAR(100) DEFAULT NULL"))
                    conn.commit()

                if "safe_word_updated_at" not in columns:
                    logger.info("Migrating schema: Adding safe_word_updated_at to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN safe_word_updated_at DATETIME DEFAULT NULL"))
                    conn.commit()
    except Exception as e:
        logger.warning(f"Schema migration notice: {e}")
