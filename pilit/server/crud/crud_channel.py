from typing import Any, Dict, List, Union

from sqlalchemy.orm import Session

from crud.crud_base import CRUDBase
from models.models import ChannelModel
from schemas.channels import ChannelCreate, ChannelUpdate, ChannelDelete


class CRUDChannel(CRUDBase[ChannelModel, ChannelCreate, ChannelUpdate, ChannelDelete]):
    def get_channels(
        self, show_id: int, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ChannelModel]:
        return (
            db.query(self.model).where(show_id=show_id).offset(skip).limit(limit).all()
        )

    def get_channel_by_id(self, db: Session, *, channel_id: int) -> List[ChannelModel]:
        return super().get(db, id=channel_id)

    # Because the ChannelCreate schema includes/requires the show ID, we can use the
    # base class's generic create() method
    def create_channel(
        self, db: Session, *, channel_to_create: ChannelCreate
    ) -> ChannelModel:
        return super().create(db, channel_to_create)

    # Because the ChannelUpdate schema includes/requires the show ID, we can use the
    # base class's generic update() method
    def update_channel(
        self,
        db: Session,
        *,
        channel_obj: ChannelModel,
        updated_channel_obj: Union[ChannelUpdate, Dict[str, Any]]
    ) -> ChannelModel:
        return super().update(db, channel_obj, updated_channel_obj)

    def remove_channel(self, db: Session, *, channel_id: int) -> ChannelModel:
        return super().remove(db, id=channel_id)


crud_channel = CRUDChannel(ChannelModel)
