from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator
import json
import pydantic.json


def _custom_json_serializer(*args, **kwargs) -> str:
    """
    Encodes json in the same way that pydantic does.
    """
    return json.dumps(*args, default=pydantic.json.pydantic_encoder, **kwargs)


# SQLALCHEMY_DATABASE_URL = "sqlite:///./pilit.db"
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/pilitdb"

engine = create_engine(SQLALCHEMY_DATABASE_URL, json_serializer=_custom_json_serializer)
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
