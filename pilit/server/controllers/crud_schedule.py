from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from controllers.crud_base import CRUDBase
from models.models import ScheduleModel
from schemas.schedules import (
    Schedule,
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleDelete,
)


def schedule_model_to_schema(schedule_model: ScheduleModel) -> Optional[Schedule]:
    if schedule_model:
        schedule = Schedule(
            id=schedule_model.id,
            name=schedule_model.name,
            days_of_week=schedule_model.days_of_week,
            start_time=schedule_model.start_time,
            show_id=schedule_model.show_id,
            is_enabled=schedule_model.is_enabled,
            duration=schedule_model.duration,
            created_at=datetime.now(tz=timezone.utc),
            updated_at=datetime.now(tz=timezone.utc),
        )
    return schedule


class CRUDSchedule(CRUDBase[Schedule, ScheduleCreate, ScheduleUpdate, ScheduleDelete]):
    def get_schedules(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[Optional[Schedule]]:
        schedule_result = db.query(self.model).offset(skip).limit(limit).all()
        schedules = []
        for schedule_model in schedule_result:
            schedule = Schedule(**schedule_model.__dict__)
            schedules.append(schedule)
        return schedules

    def get_schedule_by_id(
        self, db: Session, *, schedule_id: int, as_model: bool = False
    ) -> List[Schedule]:
        schedule_model = super().get(db, id=schedule_id)
        schedule = None
        if not as_model and schedule_model:
            schedule = schedule = Schedule(**schedule_model.__dict__)
        else:
            schedule = schedule_model
        return schedule

    def create_schedule(
        self, db: Session, *, schedule_to_create: ScheduleCreate
    ) -> Schedule:
        schedule_model = super().create(db, obj_in=schedule_to_create)
        schedule = schedule_model_to_schema(schedule_model=schedule_model)
        return schedule

    def update_schedule(
        self,
        db: Session,
        *,
        schedule_obj: Schedule,
        updated_schedule_obj: Union[ScheduleUpdate, Dict[str, Any]]
    ) -> Schedule:
        schedule_model = super().update(
            db, db_obj=schedule_obj, obj_in=updated_schedule_obj
        )
        schedule = Schedule(**schedule_model.__dict__)
        return schedule

    def remove_schedule(self, db: Session, *, schedule_id: int) -> Schedule:
        schedule_model = super().remove(db, id=schedule_id)
        schedule = Schedule(**schedule_model.__dict__)
        return schedule


crud_schedule = CRUDSchedule(ScheduleModel)
