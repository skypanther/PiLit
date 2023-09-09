from datetime import datetime, time, timezone

from pydantic import BaseModel


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
    name: str | None = ""
    days_of_week: str | None = ""
    start_time: time | None
    # duration: str | None = 0   # This is a calculated value
    show_id: str | None = 0
    is_enabled: bool | None = False


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
