"""
/channels/<show_id> GET
    ↩︎ [<CHANNEL...>]
/channels/<channel_id> GET
    ↩︎ <CHANNEL...>
/channels POST
    📄 same as <CHANNEL...>, name, show_id, channel_type_id, default_animation_type required
    ↩︎ <CHANNEL...>
/channels PUT
    📄 [ channel_id, channel_id, ... ] (in new desired sequence)
    ↩︎ 200
/channels/<channel_id> DELETE
    ↩︎ channel_id (of the deleted channel)

"""
