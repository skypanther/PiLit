"""
Endpoint definitions and model operations for: Channels

The prefix "channels" will be added to all endpoints thanks to the parent
router in __init__.py
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crud.crud_channel import crud_channel
from database import get_db
from schemas.channels import Channel, ChannelCreate, ChannelUpdate

router = APIRouter()


@router.get("/{show_id}", response_model=List[Channel])
def get_channels(
    show_id: int, db: Session = Depends(get_db)
) -> List[Optional[Channel]]:
    # Retrieve all channels.
    channels = crud_channel.get_channels(db, show_id=show_id)
    return channels


@router.get("/{show_id}/{channel_id}", response_model=Channel)
def get_channel(
    show_id: int, channel_id: int, db: Session = Depends(get_db)
) -> Optional[Channel]:
    # Retrieve the channel with the given ID
    channel = crud_channel.get_channel_by_id(db, show_id=show_id, channel_id=channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel


@router.put("/{show_id}/{channel_id}", response_model=Channel)
def update_channel(
    db: Session = Depends(get_db),
    *,
    show_id: int,
    channel_id: int,
    updated_channel: ChannelUpdate
) -> Optional[Channel]:
    # Update the channel with the given ID
    channel = crud_channel.get_channel_by_id(
        db, show_id=show_id, channel_id=channel_id, as_model=True
    )
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    channel = crud_channel.update_channel(
        db, channel_obj=channel, updated_channel_obj=updated_channel
    )
    return channel


@router.post("/{show_id}", response_model=Channel)
def create_channel(
    db: Session = Depends(get_db), *, new_channel: ChannelCreate
) -> Optional[Channel]:
    # Create a channel
    channel = crud_channel.create_channel(db, channel_to_create=new_channel)
    return channel


@router.delete("/{show_id}/{channel_id}", response_model=Channel)
def delete_channel(
    db: Session = Depends(get_db), *, show_id: int, channel_id: int
) -> Optional[Channel]:
    # Delete the channel with the given ID
    channel = crud_channel.get_channel_by_id(db, show_id=show_id, channel_id=channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    deleted_channel = crud_channel.remove_channel(db, channel_id=channel_id)
    return deleted_channel
