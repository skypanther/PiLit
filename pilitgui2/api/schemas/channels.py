from typing import List, Optional

from pydantic import BaseModel, Json

# Properties to receive via API on creation
class ChannelCreate(BaseModel):
    name: str
    mqtt_channel: str
    description: Optional[str]
    show_id: int
    channel_type_id: int
    default_animation_type_id: int
    default_animation_params: Optional[Json]
    icon: Optional[str]
    sort_index: int


# Properties to receive via API on update
class ChannelUpdate(BaseModel):
    channel_id: int
    name: Optional[str]
    mqtt_channel: Optional[str]
    description: Optional[str]
    default_animation_type_id: Optional[int]
    default_animation_params: Optional[Json]
    icon: Optional[str]
    sort_index: Optional[int]


# Properties to receive via API on delete
class ChannelDelete(BaseModel):
    channel_id: int


# Properties to return via API
class Channel(BaseModel):
    channel_id: int
    name: str
    mqtt_channel: str
    show_id: int
    channel_type_id: int
    default_animation_type_id: int
    default_animation_params: Optional[Json]
    icon: str
    sort_index: int
