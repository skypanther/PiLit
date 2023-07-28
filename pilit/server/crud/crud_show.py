from datetime import datetime
from typing import Any, Dict, List, Union

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from server.crud.crud_base import CRUDBase
from server.schemas.shows import Show, ShowCreate, ShowUpdate, ShowDelete


class CRUDShow(CRUDBase[Show, ShowCreate, ShowUpdate, ShowDelete]):
    def get_shows(self, db: Session) -> List[Show]:
        # return db.query(self.model).all()
        return super().get_multi(db, skip=0, limit=1000)

    def get_show_by_id(self, db: Session, *, show_id: int) -> List[Show]:
        return super().get(db, id=show_id)

    def create_show(self, db: Session, *, show_to_create: ShowCreate) -> Show:
        return super().create(db, show_to_create)

    def update_show(
        self,
        db: Session,
        *,
        show_obj: Show,
        updated_show_obj: Union[ShowUpdate, Dict[str, Any]]
    ) -> Show:
        if isinstance(updated_show_obj, ShowUpdate):
            updated_show_obj.edit_date = datetime.utcnow()
        else:
            updated_show_obj["edit_date"] = datetime.utcnow()
        return super().update(db, show_obj, updated_show_obj)

    def remove(self, db: Session, *, show_id: int) -> Show:
        return super().remove(db, id=show_id)


crud_show = CRUDShow(Show)
