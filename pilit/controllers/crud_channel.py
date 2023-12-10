from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from controllers.crud_base import CRUDBase
from models.models import ChannelModel
from schemas.channels import Channel, ChannelCreate, ChannelUpdate, ChannelDelete


class CRUDChannel(CRUDBase[ChannelModel, ChannelCreate, ChannelUpdate, ChannelDelete]):
    def get_channels(
        self, db: Session, *, show_id: int, skip: int = 0, limit: int = 100
    ) -> List[Optional[Channel]]:
        channel_result = (
            db.query(self.model)
            .where(ChannelModel.show_id == show_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        channels = []
        for channel in channel_result:
            channel_obj = Channel(**channel.__dict__)
            channels.append(channel_obj)
        return channels

    def get_channel_by_id(
        self, db: Session, *, show_id: int, channel_id: int, as_model: bool = False
    ) -> Optional[Channel]:
        channel_model = (
            db.query(self.model)
            .where(ChannelModel.show_id == show_id, ChannelModel.id == channel_id)
            .first()
        )
        channel = None
        if not as_model and channel_model:
            channel = Channel(**channel_model.__dict__)
        else:
            channel = channel_model
        return channel

    def create_channel(
        self, db: Session, *, channel_to_create: ChannelCreate
    ) -> Optional[Channel]:
        channel_model = super().create(db, obj_in=channel_to_create)
        channel = Channel(**channel_model.__dict__)
        return channel

    def update_channel(
        self,
        db: Session,
        *,
        channel_obj: ChannelModel,
        updated_channel_obj: Union[ChannelUpdate, Dict[str, Any]]
    ) -> Optional[Channel]:
        channel_model = super().update(
            db, db_obj=channel_obj, obj_in=updated_channel_obj
        )
        channel = Channel(**channel_model.__dict__)
        return channel

    def remove_channel(self, db: Session, *, show_id: int, channel_id: int) -> Channel:
        channel_model = super().remove(db, id=channel_id)
        # need to cascade to clips table
        channel = Channel(**channel_model.__dict__)
        return channel


crud_channel = CRUDChannel(ChannelModel)
