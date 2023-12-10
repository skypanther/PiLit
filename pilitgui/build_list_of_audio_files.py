"""Called at build time, this script creates an importable list of files
that React, and specifically the AudioNode component can use to create
a list of sound clips for use in PiLit GUI.
"""

import os

file_list = []
excludes = [".DS_Store"]

for fh in os.scandir("public/audio_clips"):
    file_list.append(fh.name)

if file_list:
    with open("public/clips.js", "w") as fh:
        fh.write("export const clips = [\n")
        for fn in file_list:
            if fn in excludes:
                continue
            fh.write(f'"{fn}",')
            fh.write("\n")
        fh.write("];")
