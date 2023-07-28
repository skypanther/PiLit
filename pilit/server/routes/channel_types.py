"""
Endpoint definitions and model operations for: ChannelTypes

The prefix "channel_types" will be added to all endpoints thanks to the parent
router in __init__.py
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server.crud.crud_channel_type import crud_channel_type
from server.database import get_db
from server.schemas.channel_types import (
    ChannelType,
    ChannelTypeCreate,
    ChannelTypeUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[ChannelType])
def get_channel_types(db: Session = Depends(get_db)) -> List[Optional[ChannelType]]:
    # Retrieve all channel_types.
    channel_types = crud_channel_type.get_channel_types(db)
    return channel_types


@router.get("/{channel_type_id}", response_model=ChannelType)
def get_channel(
    db: Session = Depends(get_db), *, channel_type_id: int
) -> Optional[ChannelType]:
    # Retrieve the channel with the given ID
    channel_type = crud_channel_type.get_channel_type_by_id(
        db, channel_type_id=channel_type_id
    )
    return channel_type


@router.put("/{channel_type_id}", response_model=ChannelType)
def update_channel_type(
    db: Session = Depends(get_db),
    *,
    channel_type_id: int,
    updated_channel_type: ChannelTypeUpdate
) -> Optional[ChannelType]:
    # Update the channel with the given ID
    channel_type = crud_channel_type.get_channel_type_by_id(
        db, channel_type_id=channel_type_id
    )
    if not channel_type:
        raise HTTPException(status_code=404, detail="Channel Type not found")
    channel_type = crud_channel_type.update_channel_type(
        db, channel_type_obj=channel_type, updated_channel_type_obj=updated_channel_type
    )
    return channel_type


@router.post("/{channel_type_id}", response_model=ChannelType)
def create_channel_type(
    db: Session = Depends(get_db), *, new_channel_type: ChannelTypeCreate
) -> Optional[ChannelType]:
    # Create a channel_type
    channel_type = crud_channel_type.create_channel_type(
        db, channel_to_create=new_channel_type
    )
    return channel_type


@router.delete("/{channel_type_id}", response_model=ChannelType)
def delete_channel_type(
    db: Session = Depends(get_db), *, channel_type_id: int
) -> Optional[ChannelType]:
    # Delete the channel with the given ID
    channel_type = crud_channel_type.get_channel_type_by_id(
        db, channel_type_id=channel_type_id
    )
    if not channel_type:
        raise HTTPException(status_code=404, detail="Channel Type not found")
    deleted_channel_type = crud_channel_type.remove_channel_type(
        db, channel_type_id=channel_type_id
    )
    return deleted_channel_type
