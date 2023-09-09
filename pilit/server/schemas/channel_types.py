from typing import List, Optional

from pydantic import BaseModel

from .common import AnimParam


# Properties to receive via API on creation
class ChannelTypeCreate(BaseModel):
    name: str
    name_on_network: str
    animation_type_id: int | None = 1
    class_name: str | None = ""


# Properties to receive via API on update
class ChannelTypeUpdate(BaseModel):
    id: int
    name: str | None = ""
    name_on_network: str | None = ""
    animation_type_id: int | None = 1
    class_name: str | None = ""


# Properties to receive via API on delete
class ChannelTypeDelete(BaseModel):
    id: int


# Properties to return via API
class ChannelType(BaseModel):
    id: int
    name: str
    name_on_network: str
    animation_type_id: int
    class_name: str
