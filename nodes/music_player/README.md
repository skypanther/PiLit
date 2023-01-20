# Music player node

This is a python script to play music as part of your light show.

Do not expect precision synchronized timing. But you _should_ be able to have timings within a second or less.

# Using this player

System/Physical Requirements:

- Sound output support -- like make sure you can play sounds from the computer before attempting to use this script
- I use a XYZ123 FM transmitter to broadcast the music. Other brands should work fine.
- Necessary cabling to connect your computer to the transmitter.

Software/Environment Requirements:

- Python 3.10+
- [Python-magic](https://github.com/ahupp/python-magic) and libmagic
- [Pydub](https://github.com/jiaaro/pydub) and ffmpeg
- [SimpleAudio](https://simpleaudio.readthedocs.io/en/latest/installation.html)

**Note:** I have tested this script on MacOS and Debian (Armbian). I have no idea if it will work on other platforms (e.g. Windows).

1. Copy the music_player folder to the computer that will play your music. Open that folder in a terminal window.
2. Make sure Python is set up (I strongly suggest using pyenv or direnv) (`python --version` should show 3.10+ as the active version on your system)
3. Create a virtual environment (`python3 -m venv venv`) and activate it (`source venv/bin/activate`)
4. Install Pydub, Python-magic, and SimpleAudio, plus their dependencies, following the instructions on those sites

## Audio clips

You must upload music clips to the music_player/media folder.

## Testing

You can test that the player is working by:

1. On your music player computer, from the music_player folder, run `python music_player.py`
2. From a computer with an MQTT client installed, enter:<br />

```
mosquitto_pub -h your_mqtt_broker.local -i publisher -t musicplayer -m 'jetsons.mp3:0:0'
```

The sound should play.

The message payload format is: `filename.ext:start_sec:end_sec`

- `filename.ext` is the name of the file, with extension (must be one of wav, mp3, ogg). Required. File must exist in the media folder and be readable by your user.
- `start_sec` (optional, default=0) is the number of _seconds_ from the start of the file to begin playing (so a value of 1 means skip the first second of the audio)
- `end_sec` (optional, default=0) is the number of _seconds_ from the end of the file to stop playing (so a value of 1 means stop playing 1 second before the clip would naturally end)

**Note** The script will throw an error and quit if you give invalid start_sec or end_sec values. For example, if you have a 3-second audio clip and send a start_sec value of 4, the music player will error out.
