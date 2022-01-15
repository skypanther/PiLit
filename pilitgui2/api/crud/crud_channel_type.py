from typing import Any, Dict, List, Union

from sqlalchemy.orm import Session

from .crud_base import CRUDBase
from models import ChannelType
from schemas.channel_types import (
    ChannelTypeCreate,
    ChannelTypeUpdate,
    ChannelTypeDelete,
)


class CRUDChannelType(
    CRUDBase[ChannelType, ChannelTypeCreate, ChannelTypeUpdate, ChannelTypeDelete]
):
    def get_channel_types(self, db: Session) -> List[ChannelType]:
        return super().get_multi(db, skip=0, limit=1000)

    def get_channel_type_by_id(
        self, db: Session, *, channel_type_id: int
    ) -> List[ChannelType]:
        return super().get(db, id=channel_type_id)

    def create_channel_type(
        self, db: Session, *, channel_type_to_create: ChannelTypeCreate
    ) -> ChannelType:
        return super().create(db, channel_type_to_create)

    def update_channel_type(
        self,
        db: Session,
        *,
        channel_type_obj: ChannelType,
        updated_channel_type_obj: Union[ChannelTypeUpdate, Dict[str, Any]]
    ) -> ChannelType:
        return super().update(db, channel_type_obj, updated_channel_type_obj)

    def remove_channel_type(self, db: Session, *, channel_type_id: int) -> ChannelType:
        return super().remove(db, id=channel_type_id)


crud_channel_type = CRUDChannelType(ChannelType)
