from typing import List, Optional

from pydantic import BaseModel, Json


# Properties to receive via API on creation
class ChannelCreate(BaseModel):
    name: str
    description: str | None = None
    mqtt_channel: str
    show_id: int
    channel_type_id: int
    icon: str | None = ""
    sort_index: int | None = 1


# Properties to receive via API on update
class ChannelUpdate(BaseModel):
    id: int
    name: str | None = None
    description: str | None = None
    mqtt_channel: str | None = None
    description: str | None = None
    icon: str | None = ""
    sort_index: int | None = None


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
    icon: str | None = ""
    sort_index: int | None = 1
