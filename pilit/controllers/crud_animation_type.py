from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException

from psycopg2.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from controllers.crud_base import CRUDBase
from models.models import AnimationTypeModel

from schemas.animation_types import (
    AnimationType,
    AnimationTypeCreate,
    AnimationTypeUpdate,
    AnimationTypeDelete,
)


class CRUDAnimationType(
    CRUDBase[
        AnimationTypeModel,
        AnimationTypeCreate,
        AnimationTypeUpdate,
        AnimationTypeDelete,
    ]
):
    def get_animation_types(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[AnimationType]:
        animation_types_result = db.query(self.model).offset(skip).limit(limit).all()
        animation_types = []
        for animationtype in animation_types_result:
            animationtype_obj = AnimationType(**animationtype.__dict__)
            animation_types.append(animationtype_obj)
        return animation_types

    def get_animation_type_by_id(
        self, db: Session, *, animation_type_id: int, as_model: bool = False
    ) -> Optional[AnimationType]:
        animation_type_model = (
            db.query(self.model)
            .where(AnimationTypeModel.id == animation_type_id)
            .first()
        )
        animation_type = None
        if not as_model and animation_type_model:
            animation_type = AnimationType(**animation_type_model.__dict__)
        else:
            animation_type = animation_type_model
        return animation_type

    def create_animation_type(
        self, db: Session, *, animation_type_to_create: AnimationTypeCreate
    ) -> AnimationType:
        try:
            animation_type_model = super().create(db, obj_in=animation_type_to_create)
        except IntegrityError as err:
            assert isinstance(err.orig, UniqueViolation)
            raise HTTPException(
                status_code=400,
                detail="Malformed request, name must be unique",
            )
        animation_type = AnimationType(**animation_type_model.__dict__)
        return animation_type

    def update_animation_type(
        self,
        db: Session,
        *,
        animation_type_obj: AnimationTypeModel,
        updated_animation_type_obj: Union[AnimationTypeUpdate, Dict[str, Any]]
    ) -> Optional[AnimationType]:
        animation_type_model = super().update(
            db, db_obj=animation_type_obj, obj_in=updated_animation_type_obj
        )
        animation_type = AnimationType(**animation_type_model.__dict__)
        return animation_type

    def remove_animation_type(
        self, db: Session, *, animation_type_id: int
    ) -> AnimationType:
        animation_type_model = super().remove(db, id=animation_type_id)
        animation_type = AnimationType(**animation_type_model.__dict__)
        return animation_type


crud_animation_type = CRUDAnimationType(AnimationTypeModel)
