"""
Endpoint definitions and model operations for: Schedules

The prefix "schedules" will be added to all endpoints thanks to the parent
router in __init__.py
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.schedules import Schedule, ScheduleCreate, ScheduleUpdate

from server.crud.crud_schedule import crud_schedule
from server.database import get_db

router = APIRouter()


@router.get("/", response_model=List[Schedule])
def get_schedules(db: Session = Depends(get_db)) -> List[Optional[Schedule]]:
    # Retrieve all schedules.
    schedules = crud_schedule.get_schedules(db)
    return schedules


@router.get("/{schedule_id}", response_model=Schedule)
def get_schedule(
    db: Session = Depends(get_db), *, schedule_id: int
) -> Optional[Schedule]:
    # Retrieve the schedule with the given ID
    schedule = crud_schedule.get_schedule_by_id(db, schedule_id=schedule_id)
    return schedule


@router.put("/{schedule_id}", response_model=Schedule)
def update_schedule(
    db: Session = Depends(get_db), *, schedule_id: int, updated_schedule: ScheduleUpdate
) -> Optional[Schedule]:
    # Update the schedule with the given ID
    schedule = crud_schedule.get_schedule_by_id(db, schedule_id=schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    schedule = crud_schedule.update_schedule(
        db, schedule_obj=schedule, updated_schedule_obj=updated_schedule
    )
    return schedule


@router.post("/{schedule_id}", response_model=Schedule)
def create_schedule(
    db: Session = Depends(get_db), *, new_schedule: ScheduleCreate
) -> Optional[Schedule]:
    # Create a schedule
    schedule = crud_schedule.create_schedule(db, schedule_to_create=new_schedule)
    return schedule


@router.delete("/{schedule_id}", response_model=Schedule)
def delete_schedule(
    db: Session = Depends(get_db), *, schedule_id: int
) -> Optional[Schedule]:
    # Delete the schedule with the given ID
    schedule = crud_schedule.get_schedule_by_id(db, schedule_id=schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    deleted_schedule = crud_schedule.remove_schedule(db, schedule_id=schedule_id)
    return deleted_schedule
