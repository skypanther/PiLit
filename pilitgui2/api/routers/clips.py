"""
/clips/<channel_id> GET
    ↩︎ [<CLIP...>]
/clips/<clip_id> GET
    ↩︎ <CLIP...>
/clips POST
    📄 same as <CLIP...>, name, channel_id, sequence, animation_type_id, animation_params required
    ↩︎ <CLIP...>
/clips PUT
    📄 [ clip_id, clip_id, ... ] (in new desired sequence)
    ↩︎ 200
/clips/<clip_id> DELETE
    ↩︎ clip_id (of the deleted clip)
"""
