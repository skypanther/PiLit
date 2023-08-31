import json
from pydantic import BaseModel, Json


# Properties to receive via API on creation
class AnimationTypeCreate(BaseModel):
    name: str
    default_params: Json | None = json.dumps({})
    payload_shape: Json | None = json.dumps({})


# Properties to receive via API on update
class AnimationTypeUpdate(BaseModel):
    id: int
    name: str | None = ""
    default_params: Json | None = json.dumps({})
    payload_shape: Json | None = json.dumps({})


# Properties to receive via API on delete
class AnimationTypeDelete(BaseModel):
    id: int


# Properties to return via API
class AnimationType(BaseModel):
    id: int
    name: str
    default_params: Json
    payload_shape: Json
