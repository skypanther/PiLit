import datetime
from typing import Optional

from pydantic import BaseModel

# Common properties
class ShowBase(BaseModel):
    name: str
    description: Optional[str]


# Properties to receive via API on creation
class ShowCreate(ShowBase):
    show_id: int
    name: str
    description: Optional[str]


# Properties to receive via API on update
class ShowUpdate(ShowBase):
    show_id: int
    name: Optional[str]
    description: Optional[str]


# Properties to receive via API on delete
class ShowDelete(BaseModel):
    show_id: int


# Additional properties stored in DB
class ShowInDB(ShowBase):
    show_id: int
    create_date: datetime.datetime
    edit_date = datetime.datetime


# Properties to return via API
class Show(ShowBase):
    show_id: int
    create_date: datetime.datetime
    edit_date = datetime.datetime
