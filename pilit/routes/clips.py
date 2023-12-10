"""
Endpoint definitions and model operations for: Clips

The prefix "clips" will be added to all endpoints thanks to the parent
router in __init__.py
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from controllers.crud_clip import crud_clip
from database import get_db
from schemas.clips import Clip, ClipCreate, ClipUpdate

router = APIRouter()


@router.get("/{channel_id}", response_model=List[Clip])
def get_clips(channel_id: int, db: Session = Depends(get_db)) -> List[Optional[Clip]]:
    # Retrieve all clips.
    clips = crud_clip.get_clips(db, channel_id=channel_id)
    return clips


@router.get("/{channel_id}/{clip_id}", response_model=Clip)
def get_clip(
    db: Session = Depends(get_db), *, channel_id: int, clip_id: int
) -> Optional[Clip]:
    # Retrieve the clip with the given ID
    clip = crud_clip.get_clip_by_id(db, channel_id=channel_id, clip_id=clip_id)
    return clip


@router.put("/{channel_id}/{clip_id}", response_model=Clip)
def update_clip(
    db: Session = Depends(get_db),
    *,
    channel_id: int,
    clip_id: int,
    updated_clip: ClipUpdate
) -> Optional[Clip]:
    # Update the clip with the given ID
    clip = crud_clip.get_clip_by_id(
        db, channel_id=channel_id, clip_id=clip_id, as_model=True
    )
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    clip = crud_clip.update_clip(db, clip_obj=clip, updated_clip_obj=updated_clip)
    return clip


@router.post("/{channel_id}", response_model=Clip)
def create_clip(
    db: Session = Depends(get_db), *, channel_id: int, new_clip: ClipCreate
) -> Optional[Clip]:
    # Create a clip
    if not channel_id:
        raise HTTPException(
            status_code=400, detail="Channel ID missing, unable to create clip"
        )
    clip = crud_clip.create_clip(db, channel_id=channel_id, clip_to_create=new_clip)
    return clip


@router.delete("/{clip_id}", response_model=Clip)
def delete_clip(db: Session = Depends(get_db), *, clip_id: int) -> Optional[Clip]:
    # Delete the clip with the given ID
    clip = crud_clip.get_clip_by_id(db, clip_id=clip_id)
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    deleted_clip = crud_clip.remove_clip(db, clip_id=clip_id)
    return deleted_clip
