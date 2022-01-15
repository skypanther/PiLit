from typing import Optional

from pydantic import BaseModel, Json

# Properties to receive via API on creation
class ClipCreate(BaseModel):
    channel_id: int
    name: Optional[str]
    sort_index: int
    animation_type_id: int
    animation_params: Optional[Json]
    duration: int
    class_name: Optional[str]


# Properties to receive via API on update
class ClipUpdate(BaseModel):
    clip_id: int
    name: Optional[str]
    sort_index: Optional[int]
    animation_type_id: Optional[int]
    animation_params: Optional[Json]
    duration: Optional[int]
    class_name: Optional[str]


# Properties to receive via API on delete
class ClipDelete(BaseModel):
    clip_id: int


# Properties to return via API
class Clip(BaseModel):
    clip_id: int
    channel_id: int
    name: str
    sort_index: int
    animation_type_id: int
    animation_params: Optional[Json]
    duration: int
    class_name: str
