from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from crud.crud_base import CRUDBase
from models.models import ShowModel
from schemas.shows import Show, ShowCreate, ShowUpdate, ShowDelete


class CRUDShow(CRUDBase[ShowModel, ShowCreate, ShowUpdate, ShowDelete]):
    def get_shows(self, db: Session) -> List[Show]:
        # return db.query(self.model).all()
        shows_result = super().get_multi(db, skip=0, limit=1000)
        shows = []
        for show_model in shows_result:
            show = Show(
                id=show_model.id,
                name=show_model.name,
                description=show_model.description,
                created_at=show_model.created_at,
                updated_at=show_model.updated_at,
            )
            shows.append(show)
        return shows

    def get_show_by_id(self, db: Session, *, show_id: int) -> Optional[Show]:
        show_model = super().get(db, id=show_id)
        show = None
        if show_model:
            show = Show(
                id=show_model.id,
                name=show_model.name,
                description=show_model.description,
                created_at=show_model.created_at,
                updated_at=show_model.updated_at,
            )
        return show

    def create_show(self, db: Session, *, show_to_create: ShowCreate) -> ShowModel:
        return super().create(db, show_to_create)

    def update_show(
        self,
        db: Session,
        *,
        show_obj: ShowModel,
        updated_show_obj: Union[ShowUpdate, Dict[str, Any]]
    ) -> ShowModel:
        if isinstance(updated_show_obj, ShowUpdate):
            updated_show_obj.edit_date = datetime.utcnow()
        else:
            updated_show_obj["edit_date"] = datetime.utcnow()
        return super().update(db, show_obj, updated_show_obj)

    def remove(self, db: Session, *, show_id: int) -> ShowModel:
        return super().remove(db, id=show_id)


crud_show = CRUDShow(ShowModel)
