from typing import List

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from .crud_base import CRUDBase
from models import Show
from schemas.shows import ShowCreate, ShowUpdate, ShowDelete


class CRUDShow(CRUDBase[Show, ShowCreate, ShowUpdate, ShowDelete]):
    def get_shows(self, db: Session) -> List[Show]:
        return db.query(self.model).all()

    def get_show_by_id(self, db: Session, show_id: int) -> List[Show]:
        return db.query(self.model).filter(Show.show_id == show_id).all()

    # def create_with_owner(
    #     self, db: Session, *, obj_in: ShowCreate, owner_id: int
    # ) -> Show:
    #     obj_in_data = jsonable_encoder(obj_in)
    #     db_obj = self.model(**obj_in_data, owner_id=owner_id)
    #     db.add(db_obj)
    #     db.commit()
    #     db.refresh(db_obj)
    #     return db_obj


crud_show = CRUDShow(Show)
