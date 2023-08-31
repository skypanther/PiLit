from pydantic import BaseModel
from typing import List, Union


class AnimParam(BaseModel):
    name: str
    data_type: Union[str, int, bool, float]
    value: Union[str, int, bool, float]
    default_value: Union[str, int, bool, float] | None


class AnimationParams(BaseModel):
    required: List[AnimParam]
    optional: List[AnimParam] | None = []
