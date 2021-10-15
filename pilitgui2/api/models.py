from sqlalchemy import Boolean, Column, Integer, String, TIME
from sqlalchemy.sql.sqltypes import JSON, DateTime

from database import Base


class Show(Base):
    __tablename__ = "shows"

    show_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    create_date = Column(DateTime)
    edit_date = Column(DateTime)
    description = Column(String)


class Channel(Base):
    __tablename__ = "channels"

    channel_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    show_id = Column(Integer)  # , ForeignKey("shows.show_id"), relationship()
    channel_type_id = Column(Integer)  # , ForeignKey("channel_types.channel_type_id")
    icon = Column(String)
    sort_index = Column(Integer)


class Clip(Base):
    __tablename__ = "clips"

    clip_id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer)  # , ForeignKey("channels.channel_id")
    name = Column(String)
    sort_index = Column(Integer)
    animation_type_id = Column(
        Integer
    )  # , ForeignKey("animation_types.animation_type_id")
    animation_params = Column(JSON)
    duration = Column(Integer)
    class_name = Column(String)


class ChannelType(Base):
    __tablename__ = "channel_types"

    channel_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    animation_type_id = Column(
        Integer
    )  # , ForeignKey("animation_types.animation_type_id")
    default_animation_type_id = Column(
        Integer
    )  # , ForeignKey("animation_types.animation_type_id")
    default_animation_params = Column(JSON)
    class_name = Column(String)


class AnimationType(Base):
    __tablename__ = "animation_types"

    animation_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    animation_params = Column(JSON)


class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    days_of_week = Column(String)
    start_time = Column(TIME)
    duration = Column(Integer)
    show_id = Column(Integer)  # , ForeignKey("shows.show_id")
    is_enabled = Column(Boolean, default=False)
