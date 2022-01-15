from datetime import time
from typing import Optional, Literal

from pydantic import BaseModel

# Properties to receive via API on creation
class ScheduleCreate(BaseModel):
    name: str
    days_of_week: Optional[Literal["A", "M", "T", "W", "H", "F", "S", "U"]] = "A"
    start_time: Optional[time]
    duration: Optional[int]
    show_id: int
    is_enabled: Optional[bool] = False


# Properties to receive via API on update
class ScheduleUpdate(BaseModel):
    schedule_id: int
    name: Optional[str]
    days_of_week: Optional[str]
    start_time: Optional[time]
    duration: Optional[int]
    is_enabled: Optional[bool] = False


# Properties to receive via API on delete
class ScheduleDelete(BaseModel):
    schedule_id: int


# Properties to return via API
class Schedule(BaseModel):
    schedule_id: int
    name: str
    days_of_week: Literal["A", "M", "T", "W", "H", "F", "S", "U"] = "A"
    start_time: time
    duration: int
    show_id: int
    is_enabled: bool
