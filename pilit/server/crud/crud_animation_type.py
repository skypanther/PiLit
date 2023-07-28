from typing import Any, Dict, List, Union

from sqlalchemy.orm import Session

from server.crud.crud_base import CRUDBase
from server.schemas.animation_types import (
    AnimationType,
    AnimationTypeCreate,
    AnimationTypeUpdate,
    AnimationTypeDelete,
)


class CRUDAnimationType(
    CRUDBase[
        AnimationType, AnimationTypeCreate, AnimationTypeUpdate, AnimationTypeDelete
    ]
):
    def get_animation_types(self, db: Session) -> List[AnimationType]:
        return super().get_multi(db, skip=0, limit=1000)

    def get_animation_type_by_id(
        self, db: Session, *, animation_type_id: int
    ) -> List[AnimationType]:
        return super().get(db, id=animation_type_id)

    def create_animation_type(
        self, db: Session, *, animation_type_to_create: AnimationTypeCreate
    ) -> AnimationType:
        return super().create(db, animation_type_to_create)

    def update_animation_type(
        self,
        db: Session,
        *,
        animation_type_obj: AnimationType,
        updated_animation_type_obj: Union[AnimationTypeUpdate, Dict[str, Any]]
    ) -> AnimationType:
        return super().update(db, animation_type_obj, updated_animation_type_obj)

    def remove_animation_type(
        self, db: Session, *, animation_type_id: int
    ) -> AnimationType:
        return super().remove(db, id=animation_type_id)


crud_animation_type = CRUDAnimationType(AnimationType)
