"""
Endpoint definitions and model operations for: Shows
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from crud.show import crud_show
from database import get_db
from models import Show
from schemas.shows import Show

router = APIRouter()


"""
The prefix "shows" will be added to all endpoints thanks to the parent router
"""


@router.get("/", response_model=List[Show])
def get_shows(db: Session = Depends(get_db)) -> Any:
    """
    Retrieve all shows.
    """
    shows = crud_show.get_shows(db)
    return shows


# @router.get("/{show_id}", response_model=Show)
# def get_show(*, show_id: int) -> Optional[Show]:
#     """
#     Retrieve the show with the given ID
#     """
#     show = db.query(Show).filter(Show.show_id == show_id).first()
#     return show


"""
/shows POST
    📄 same as <SHOW...>, name required; show_id, create_date, and edit_date not allowed
    ↩︎ <SHOW...>
/shows/<show_id> DELETE
    ↩︎ show_id (of the deleted show)
"""
