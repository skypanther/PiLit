from typing import Any, Dict, List, Union

from sqlalchemy.orm import Session

from .crud_base import CRUDBase
from schemas.channels import Channel, ChannelCreate, ChannelUpdate, ChannelDelete


class CRUDChannel(CRUDBase[Channel, ChannelCreate, ChannelUpdate, ChannelDelete]):
    def get_channels(self, db: Session) -> List[Channel]:
        return super().get_multi(db, skip=0, limit=1000)

    def get_channel_by_id(self, db: Session, *, channel_id: int) -> List[Channel]:
        return super().get(db, id=channel_id)

    def create(self, db: Session, *, channel_to_create: ChannelCreate) -> Channel:
        return super().create(db, channel_to_create)

    def update_channel(
        self,
        db: Session,
        *,
        channel_obj: Channel,
        updated_channel_obj: Union[ChannelUpdate, Dict[str, Any]]
    ) -> Channel:
        return super().update(db, channel_obj, updated_channel_obj)

    def remove_channel(self, db: Session, *, channel_id: int) -> Channel:
        return super().remove(db, id=channel_id)


crud_channel = CRUDChannel(Channel)
