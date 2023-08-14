from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from controllers.crud_base import CRUDBase
from models.models import ClipModel
from schemas.clips import Clip, ClipCreate, ClipUpdate, ClipDelete


class CRUDClip(CRUDBase[Clip, ClipCreate, ClipUpdate, ClipDelete]):
    def get_clips(
        self, db: Session, *, channel_id: int, skip: int = 0, limit: int = 100
    ) -> List[Optional[Clip]]:
        clip_results = (
            db.query(self.model)
            .where(ClipModel.channel_id == channel_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        clips = []
        for clip in clip_results:
            clip_obj = Clip(**clip.__dict__)
            clips.append(clip_obj)
        return clips

    def get_clip_by_id(
        self, db: Session, *, clip_id: int, channel_id: int, as_model: bool = False
    ) -> Optional[Clip]:
        clip_model = (
            db.query(self.model)
            .where(ClipModel.channel_id == channel_id, ClipModel.id == clip_id)
            .first()
        )
        clip = None
        if not as_model and clip_model:
            clip = Clip(**clip_model.__dict__)
        else:
            clip = clip_model
        return clip

    def create_clip(
        self, db: Session, *, channel_id: int, clip_to_create: ClipCreate
    ) -> Clip:
        clip_model = super().create(db, obj_in=clip_to_create)
        clip = Clip(**clip_model.__dict__)
        return clip

    def update_clip(
        self,
        db: Session,
        *,
        clip_obj: Clip,
        updated_clip_obj: Union[ClipUpdate, Dict[str, Any]]
    ) -> Optional[Clip]:
        clip_model = super().update(db, db_obj=clip_obj, obj_in=updated_clip_obj)
        clip = Clip(**clip_model.__dict__)
        return clip

    def remove_clip(self, db: Session, *, clip_id: int) -> Clip:
        clip_model = super().remove(db, id=clip_id)
        clip = Clip(**clip_model.__dict__)
        return clip


crud_clip = CRUDClip(ClipModel)
