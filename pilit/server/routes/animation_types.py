"""
Endpoint definitions and model operations for: AnimationTypes

The prefix "animation_types" will be added to all endpoints thanks to the parent
router in __init__.py
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from controllers.crud_animation_type import crud_animation_type
from database import get_db
from models.models import AnimationTypeModel
from schemas.animation_types import (
    AnimationType,
    AnimationTypeCreate,
    AnimationTypeUpdate,
)

router = APIRouter()
not_found_message = "Animation Type not found"


@router.get("/", response_model=List[AnimationType])
def get_animation_types(db: Session = Depends(get_db)) -> List[Optional[AnimationType]]:
    # Retrieve all animation_types.
    animation_types = crud_animation_type.get_animation_types(db)
    return animation_types


@router.get("/{animation_type_id}", response_model=AnimationType)
def get_animation_type(
    db: Session = Depends(get_db), *, animation_type_id: int
) -> Optional[AnimationType]:
    # Retrieve the animation_type with the given ID
    animation_type = crud_animation_type.get_animation_type_by_id(
        db, animation_type_id=animation_type_id
    )
    if not animation_type:
        raise HTTPException(status_code=404, detail=not_found_message)
    return animation_type


@router.put("/{animation_type_id}", response_model=AnimationType)
def update_animation_type(
    db: Session = Depends(get_db),
    *,
    animation_type_id: int,
    updated_animation_type: AnimationTypeUpdate
) -> Optional[AnimationType]:
    # Update the animation_type with the given ID
    animation_type_model = crud_animation_type.get_animation_type_by_id(
        db, animation_type_id=animation_type_id, as_model=True
    )
    if not animation_type_model:
        raise HTTPException(status_code=404, detail=not_found_message)
    animation_type = crud_animation_type.update_animation_type(
        db,
        animation_type_obj=animation_type_model,
        updated_animation_type_obj=updated_animation_type,
    )
    return animation_type


@router.post("/", response_model=AnimationType)
def create_animation_type(
    db: Session = Depends(get_db), *, new_animation_type: AnimationTypeCreate
) -> Optional[AnimationType]:
    # Create a animation_type
    animation_type = crud_animation_type.create_animation_type(
        db, animation_type_to_create=new_animation_type
    )
    return animation_type


@router.delete("/{animation_type_id}", response_model=AnimationType)
def delete_animation_type(
    db: Session = Depends(get_db), *, animation_type_id: int
) -> Optional[AnimationType]:
    # Delete the animation_type with the given ID
    animation_type = crud_animation_type.get_animation_type_by_id(
        db, animation_type_id=animation_type_id
    )
    if not animation_type:
        raise HTTPException(status_code=404, detail=not_found_message)
    deleted_animation_type = crud_animation_type.remove_animation_type(
        db, animation_type_id=animation_type_id
    )
    return deleted_animation_type
