from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

# SQLALCHEMY_DATABASE_URL = "sqlite:///./pilit.db"
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/pilitdb"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Create all tables derived from the EntityBase object
    Base.metadata.create_all(bind=engine)
