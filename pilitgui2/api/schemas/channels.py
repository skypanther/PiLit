from typing import List, Optional

from pydantic import BaseModel

from .common import AnimParam

# Properties to receive via API on creation
class ChannelCreate(BaseModel):
    name: str
    description: Optional[str]
    channel_id: int
    icon: Optional[str]
    sort_index: int


# Properties to receive via API on update
class ChannelUpdate(BaseModel):
    channel_id: int
    name: Optional[str]
    description: Optional[str]
    channel_id: Optional[int]
    icon: Optional[str]
    sort_index: Optional[int]


# Properties to receive via API on delete
class ChannelDelete(BaseModel):
    channel_id: int


# Properties to return via API
class Channel(BaseModel):
    channel_id: int
    name: str
    description: str
    channel_id: int
    show_id: int
    channel_type_id: int
    icon: str
    sort_index: int
