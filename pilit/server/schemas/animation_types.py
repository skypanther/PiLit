import json
from pydantic import BaseModel, Json

from schemas.common import AnimationParams


# Properties to receive via API on creation
class AnimationTypeCreate(BaseModel):
    name: str
    animation_params: AnimationParams


# Properties to receive via API on update
class AnimationTypeUpdate(BaseModel):
    id: int
    name: str | None = None
    animation_params: AnimationParams | None = None


# Properties to receive via API on delete
class AnimationTypeDelete(BaseModel):
    id: int


# Properties to return via API
class AnimationType(BaseModel):
    id: int
    name: str
    animation_params: AnimationParams
