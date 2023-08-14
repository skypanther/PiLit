from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from controllers.crud_base import CRUDBase
from models.models import ShowModel
from schemas.shows import Show, ShowCreate, ShowUpdate, ShowDelete


# def show_model_to_schema(show_model: ShowModel) -> Optional[Show]:
# Not used, would be useful when mapping a subset of fields to the schema)
#     if show_model:
#         show = Show(
#             id=show_model.id,
#             name=show_model.name,
#             description=show_model.description,
#             created_at=show_model.created_at,
#             updated_at=show_model.updated_at,
#         )
#     return show


class CRUDShow(CRUDBase[ShowModel, ShowCreate, ShowUpdate, ShowDelete]):
    def get_shows(self, db: Session) -> List[Show]:
        # return db.query(self.model).all()
        shows_result = super().get_multi(db, skip=0, limit=1000)
        shows = []
        for show_model in shows_result:
            show = Show(**show_model.__dict__)
            shows.append(show)
        return shows

    def get_show_by_id(
        self, db: Session, *, show_id: int, as_model: bool = False
    ) -> Optional[Show]:
        show_model = super().get(db, id=show_id)
        show = None
        if not as_model and show_model:
            show = Show(**show_model.__dict__)
        else:
            show = show_model
        return show

    def create_show(self, db: Session, *, show_to_create: ShowCreate) -> Optional[Show]:
        show_model = super().create(db, obj_in=show_to_create)
        show = Show(**show_model.__dict__)
        return show

    def update_show(
        self,
        db: Session,
        *,
        show_obj: ShowModel,
        updated_show_obj: Union[ShowUpdate, Dict[str, Any]],
    ) -> ShowModel:
        show_model = super().update(db, db_obj=show_obj, obj_in=updated_show_obj)
        show = Show(**show_model.__dict__)
        return show

    def remove_show(self, db: Session, *, show_id: int) -> ShowModel:
        show_model = super().remove(db, id=show_id)
        # need to cascade at least to the channels and schedules tables
        show = Show(**show_model.__dict__)
        return show


crud_show = CRUDShow(ShowModel)
