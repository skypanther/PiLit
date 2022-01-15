from typing import List, Optional

from pydantic import BaseModel

from .common import AnimParam

# Properties to receive via API on creation
class ChannelTypeCreate(BaseModel):
    name: Optional[str]
    animation_type_id: Optional[int]
    class_name: Optional[str]


# Properties to receive via API on update
class ChannelTypeUpdate(BaseModel):
    channel_type_id: int
    name: Optional[str]
    animation_type_id: Optional[int]
    class_name: Optional[str]


# Properties to receive via API on delete
class ChannelTypeDelete(BaseModel):
    channel_type_id: int


# Properties to return via API
class ChannelType(BaseModel):
    channel_type_id: int
    name: str
    animation_type_id: int
    class_name: str
