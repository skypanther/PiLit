from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    JSON,
    Time,
    func,
)


from database import Base


# models are listed here roughly how they are logically nested
# schedules manage shows, which contain channels, which contain clips
# (the type classes for channels and clips are in-line)
class ScheduleModel(Base):
    # Ref = schedules.show_id > shows.id
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    days_of_week = Column(String, default="All", nullable=False)
    start_time = Column(Time, nullable=False)
    duration = Column(Integer, default=0)
    show_id = Column(Integer, nullable=False)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )


class ShowModel(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )


class ChannelModel(Base):
    # Ref = channels.show_id > shows.id  // many-to-one
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    mqtt_channel = Column(String, nullable=False)
    show_id = Column(Integer, nullable=False)  # fk to shows.id"
    channel_type_id = Column(Integer, nullable=False)  # fk to channel_types.id"
    icon = Column(String, nullable=True)
    sort_index = Column(Integer, default=0)


class ChannelTypeModel(Base):
    # Ref = channel_types.id <> channels.channel_type_id
    __tablename__ = "channel_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    name_on_network = Column(String, unique=True)
    animation_type_id = Column(Integer)  # fk to AnimationTypes.id
    class_name = Column(String, nullable=True)


class ClipModel(Base):
    # Ref = clips.channel_id > channels.id  // many-to-one
    __tablename__ = "clips"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, nullable=False)
    sort_index = Column(Integer, nullable=False)
    animation_type_id = Column(Integer, nullable=False)
    animation_params = Column(JSON, nullable=True)
    duration = Column(Integer, nullable=False)
    class_name = Column(String, nullable=True)


class AnimationTypeModel(Base):
    # Ref = animation_types.id <> clips.animation_type_id
    __tablename__ = "animation_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    animation_params = Column(JSON, nullable=True)
