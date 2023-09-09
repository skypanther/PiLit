from datetime import datetime

from pydantic import BaseModel


# Properties to receive via API on creation
class ShowCreate(BaseModel):
    name: str
    description: str | None = ""


# Properties to receive via API on update
class ShowUpdate(BaseModel):
    id: int
    name: str | None = ""
    description: str | None = ""


# Properties to receive via API on delete
class ShowDelete(BaseModel):
    id: int


# Properties to return via API
class Show(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime
    updated_at: datetime
