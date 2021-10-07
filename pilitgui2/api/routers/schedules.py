"""
/schedules GET
    ↩︎ [<SCHEDULE_TYPE...>]
/schedules/<schedule_id> GET
    ↩︎ <SCHEDULE_TYPE...>
/schedules POST
    📄 same as <SCHEDULE_TYPE...>, all but the ID required
    ↩︎ <SCHEDULE_TYPE...>
/schedules/<schedule_id> DELETE
    ↩︎ schedule_id (of the deleted animation_type)
/schedules/{schedule_id}/activate
    * adds a cron job on the server to kick off the show schedule at the start time
/schedules/{schedule_id}/deactivate
    * removes the cron entry so that the show is no longer run at the scheduled time

"""
