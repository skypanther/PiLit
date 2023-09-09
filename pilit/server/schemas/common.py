from pydantic import BaseModel
from typing import List


class AnimParam(BaseModel):
    name: str
    data_type: str | None = "str"  # used as Union[str, int, bool, float]
    value: str | None = ""  # flexible value based on data_type
    default_value: str | None = ""  # flexible value based on data_type


class AnimationParams(BaseModel):
    required: List[AnimParam] | None = []
    optional: List[AnimParam] | None = []
