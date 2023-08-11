"""
Endpoint definitions and model operations for: Shows

The prefix "shows" will be added to all endpoints thanks to the parent
router in __init__.py
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.shows import ShowCreate, ShowUpdate

from crud.crud_show import crud_show
from database import get_db
from schemas.shows import Show

router = APIRouter()


@router.get("/", response_model=List[Show])
def get_shows(db: Session = Depends(get_db)) -> List[Optional[Show]]:
    # Retrieve all shows.
    shows = crud_show.get_shows(db)
    return shows


@router.get("/{show_id}", response_model=Show)
def get_show(db: Session = Depends(get_db), *, show_id: int) -> Optional[Show]:
    # Retrieve the show with the given ID
    show = crud_show.get_show_by_id(db, show_id=show_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show


@router.put("/{show_id}", response_model=Show)
def update_show(
    db: Session = Depends(get_db), *, show_id: int, updated_show: ShowUpdate
) -> Optional[Show]:
    # Update the show with the given ID
    show = crud_show.get_show_by_id(db, show_id=show_id, as_model=True)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    show = crud_show.update_show(db, show_obj=show, updated_show_obj=updated_show)
    return show


@router.post("/", response_model=Show)
def create_show(
    db: Session = Depends(get_db), *, new_show: ShowCreate
) -> Optional[Show]:
    # Create a show
    show = crud_show.create_show(db, show_to_create=new_show)
    return show


@router.delete("/{show_id}", response_model=Show)
def delete_show(db: Session = Depends(get_db), *, show_id: int) -> Optional[Show]:
    # Delete the show with the given ID
    show = crud_show.get_show_by_id(db, show_id=show_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    deleted_show = crud_show.remove_show(db, show_id=show_id)
    return deleted_show
