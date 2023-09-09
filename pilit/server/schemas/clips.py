# A clip is a single animation in a channel. The channels animation sequence is
# made up of one or more clips
import json
from typing import Optional

from pydantic import BaseModel, Json


# Properties to receive via API on creation
class ClipCreate(BaseModel):
    channel_id: int
    sort_index: int
    animation_type_id: int
    animation_params: Json | None = json.dumps({})
    duration: int
    class_name: str | None = ""


# Properties to receive via API on update
class ClipUpdate(BaseModel):
    id: int
    channel_id: int | None = None  # would enable moving to a different channel
    sort_index: int | None = None
    animation_type_id: int | None = None
    animation_params: Json | None = json.dumps({})
    duration: int | None = None
    class_name: str | None = ""


# Properties to receive via API on delete
class ClipDelete(BaseModel):
    id: int


# Properties to return via API
class Clip(BaseModel):
    id: int
    channel_id: int
    sort_index: int
    animation_type_id: int
    animation_params: Json
    duration: int
    class_name: str
