import datetime
from typing import Optional

from pydantic import BaseModel

# Properties to receive via API on creation
class ShowCreate(BaseModel):
    name: str
    description: Optional[str]


# Properties to receive via API on update
class ShowUpdate(BaseModel):
    show_id: int
    name: Optional[str]
    description: Optional[str]
    edit_date = datetime.datetime


# Properties to receive via API on delete
class ShowDelete(BaseModel):
    show_id: int


# Properties to return via API
class Show(BaseModel):
    show_id: int
    name: str
    description: str
    create_date: datetime.datetime
    edit_date = datetime.datetime
