from pydantic import BaseModel
from typing import List, Optional, Union

from sqlalchemy.sql.sqltypes import Enum


class AnimParam(BaseModel):
    name: str
    data_type: Union[str, int, bool, float]
    value: Union[str, int, bool, float]
    default_value: Optional[Union[str, int, bool, float]]


class AnimationParams(BaseModel):
    required: List[AnimParam]
    optional: Optional[List[AnimParam]]


class DOTW(str, Enum):
    all = "all"
    mon = "mon"
    tue = "tue"
    wed = "wed"
    thu = "thu"
    fri = "fri"
    sat = "sat"
    sun = "sun"


class DaysOfTheWeek(BaseModel):
    dotw: List(DOTW) = []
