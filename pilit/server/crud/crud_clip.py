from typing import Any, Dict, List, Union

from sqlalchemy.orm import Session

from server.crud.crud_base import CRUDBase
from server.schemas.clips import Clip, ClipCreate, ClipUpdate, ClipDelete


class CRUDClip(CRUDBase[Clip, ClipCreate, ClipUpdate, ClipDelete]):
    def get_clips(self, db: Session) -> List[Clip]:
        return super().get_multi(db, skip=0, limit=1000)

    def get_clip_by_id(self, db: Session, *, clip_id: int) -> List[Clip]:
        return super().get(db, id=clip_id)

    def create_clip(self, db: Session, *, clip_to_create: ClipCreate) -> Clip:
        return super().create(db, clip_to_create)

    def update_clip(
        self,
        db: Session,
        *,
        clip_obj: Clip,
        updated_clip_obj: Union[ClipUpdate, Dict[str, Any]]
    ) -> Clip:
        return super().update(db, clip_obj, updated_clip_obj)

    def remove_clip(self, db: Session, *, clip_id: int) -> Clip:
        return super().remove(db, id=clip_id)


crud_clip = CRUDClip(Clip)
