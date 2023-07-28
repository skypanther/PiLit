from typing import Any, Dict, List, Union

from sqlalchemy.orm import Session

from server.crud.crud_base import CRUDBase
from server.schemas.schedules import (
    Schedule,
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleDelete,
)


class CRUDSchedule(CRUDBase[Schedule, ScheduleCreate, ScheduleUpdate, ScheduleDelete]):
    def get_schedules(self, db: Session) -> List[Schedule]:
        return super().get_multi(db, skip=0, limit=1000)

    def get_schedule_by_id(self, db: Session, *, schedule_id: int) -> List[Schedule]:
        return super().get(db, id=schedule_id)

    def create_schedule(
        self, db: Session, *, schedule_to_create: ScheduleCreate
    ) -> Schedule:
        return super().create(db, schedule_to_create)

    def update_schedule(
        self,
        db: Session,
        *,
        schedule_obj: Schedule,
        updated_schedule_obj: Union[ScheduleUpdate, Dict[str, Any]]
    ) -> Schedule:
        return super().update(db, schedule_obj, updated_schedule_obj)

    def remove_schedule(self, db: Session, *, schedule_id: int) -> Schedule:
        return super().remove(db, id=schedule_id)


crud_schedule = CRUDSchedule(Schedule)
