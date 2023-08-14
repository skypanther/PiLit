from datetime import datetime, time, timezone
from typing import Optional

from pydantic import BaseModel
from models.enums import DaysOfWeek


# Properties to receive via API on creation
class ScheduleCreate(BaseModel):
    name: str
    days_of_week: str
    start_time: time
    duration: int | None = 0  # This is a calculated value
    show_id: int
    is_enabled: bool | None = True
    created_at: datetime | None = datetime.now(tz=timezone.utc)
    updated_at: datetime | None = datetime.now(tz=timezone.utc)


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
    days_of_week: str
    start_time: time
    duration: int
    show_id: int
    is_enabled: bool
    created_at: datetime | None
    updated_at: datetime | None
