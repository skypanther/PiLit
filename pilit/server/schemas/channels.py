from typing import List, Optional

from pydantic import BaseModel, Json


# Properties to receive via API on creation
class ChannelCreate(BaseModel):
    name: str
    description: Optional[str]
    mqtt_channel: str
    show_id: int
    channel_type_id: int
    icon: Optional[str]
    sort_index: int = 0


# Properties to receive via API on update
class ChannelUpdate(BaseModel):
    id: int
    name: Optional[str]
    description: Optional[str]
    mqtt_channel: Optional[str]
    description: Optional[str]
    icon: Optional[str]
    sort_index: Optional[int]


# Properties to receive via API on delete
class ChannelDelete(BaseModel):
    id: int


# Properties to return via API
class Channel(BaseModel):
    id: int
    name: str
    description: str
    mqtt_channel: str
    show_id: int
    channel_type_id: int
    icon: str
    sort_index: int = 0
