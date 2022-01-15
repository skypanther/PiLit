from typing import Optional

from pydantic import BaseModel, Json

# Properties to receive via API on creation
class AnimationTypeCreate(BaseModel):
    name: str
    animation_params: Optional[Json]


# Properties to receive via API on update
class AnimationTypeUpdate(BaseModel):
    animation_type_id: int
    name: Optional[str]
    animation_params: Optional[Json]


# Properties to receive via API on delete
class AnimationTypeDelete(BaseModel):
    animation_type_id: int


# Properties to return via API
class AnimationType(BaseModel):
    animation_type_id: int
    name: str
    animation_params: Optional[Json]
