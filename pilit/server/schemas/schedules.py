from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel
from server.models.enums import DaysOfWeek


# Properties to receive via API on creation
class ScheduleCreate(BaseModel):
    name: str
    days_of_week: Optional[DaysOfWeek] = "A"
    start_time: time
    # duration: int  # This is a calculated value
    show_id: int
    is_enabled: Optional[bool] = True


# Properties to receive via API on update
class ScheduleUpdate(BaseModel):
    id: int
    name: Optional[str]
    days_of_week: Optional[str]
    start_time: Optional[time]
    # duration: Optional[int]   # This is a calculated value
    show_id: Optional[int]
    is_enabled: Optional[bool]


# Properties to receive via API on delete
class ScheduleDelete(BaseModel):
    id: int


# Properties to return via API
class Schedule(BaseModel):
    id: int
    name: str
    days_of_week: DaysOfWeek
    start_time: time
    duration: int
    show_id: int
    is_enabled: bool
    created_at: datetime
    updated_at: datetime
