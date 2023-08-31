from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException

from psycopg2.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from controllers.crud_base import CRUDBase
from models.models import ChannelTypeModel
from schemas.channel_types import (
    ChannelType,
    ChannelTypeCreate,
    ChannelTypeUpdate,
    ChannelTypeDelete,
)


class CRUDChannelType(
    CRUDBase[ChannelTypeModel, ChannelTypeCreate, ChannelTypeUpdate, ChannelTypeDelete]
):
    def get_channel_types(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Optional[ChannelType]]:
        channel_types_result = db.query(self.model).offset(skip).limit(limit).all()
        channel_types = []
        for channeltype in channel_types_result:
            channeltype_obj = ChannelType(**channeltype.__dict__)
            channel_types.append(channeltype_obj)
        return channel_types

    def get_channel_type_by_id(
        self, db: Session, *, channel_type_id: int, as_model: bool = False
    ) -> Optional[ChannelType]:
        channel_type_model = (
            db.query(self.model).where(ChannelTypeModel.id == channel_type_id).first()
        )
        channel_type = None
        if not as_model and channel_type_model:
            channel_type = ChannelType(**channel_type_model.__dict__)
        else:
            channel_type = channel_type_model
        return channel_type

    def create_channel_type(
        self, db: Session, *, channel_type_to_create: ChannelTypeCreate
    ) -> Optional[ChannelType]:
        try:
            channel_type_model = super().create(db, obj_in=channel_type_to_create)
        except IntegrityError as err:
            assert isinstance(err.orig, UniqueViolation)
            raise HTTPException(
                status_code=400,
                detail="Malformed request, name and name_on_network must be unique",
            )
        channel_type = ChannelType(**channel_type_model.__dict__)
        return channel_type

    def update_channel_type(
        self,
        db: Session,
        *,
        channel_type_obj: ChannelTypeModel,
        updated_channel_type_obj: Union[ChannelTypeUpdate, Dict[str, Any]]
    ) -> Optional[ChannelType]:
        channel_type_model = super().update(
            db, db_obj=channel_type_obj, obj_in=updated_channel_type_obj
        )
        channel_type = ChannelType(**channel_type_model.__dict__)
        return channel_type

    def remove_channel_type(self, db: Session, *, channel_type_id: int) -> ChannelType:
        channel_type_model = super().remove(db, id=channel_type_id)
        channel_type = ChannelType(**channel_type_model.__dict__)
        return channel_type


crud_channel_type = CRUDChannelType(ChannelTypeModel)
