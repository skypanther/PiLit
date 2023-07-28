from typing import Optional

from pydantic import BaseModel, Json


# Properties to receive via API on creation
class AnimationTypeCreate(BaseModel):
    name: str
    default_params: Optional[Json]
    payload_shape: Optional[Json]


# Properties to receive via API on update
class AnimationTypeUpdate(BaseModel):
    id: int
    name: Optional[str]
    default_params: Optional[Json]
    payload_shape: Optional[Json]


# Properties to receive via API on delete
class AnimationTypeDelete(BaseModel):
    id: int


# Properties to return via API
class AnimationType(BaseModel):
    id: int
    name: str
    default_params: Json
    payload_shape: Json
