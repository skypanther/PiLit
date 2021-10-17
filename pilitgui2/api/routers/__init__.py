from fastapi import APIRouter

from . import (
    animation_types,
    channel_types,
    channels,
    clips,
    schedules,
    shows,
)

api_router = APIRouter()
api_router.include_router(
    animation_types.router, prefix="/animation_types", tags=["animation_types"]
)
api_router.include_router(
    channel_types.router, prefix="/channel_types", tags=["channel_types"]
)
api_router.include_router(channels.router, prefix="/channels", tags=["channels"])
api_router.include_router(clips.router, prefix="/clips", tags=["clips"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(shows.router, prefix="/shows", tags=["shows"])
