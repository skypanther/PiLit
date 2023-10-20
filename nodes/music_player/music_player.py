import os.path

from decimal import Decimal
from time import sleep
from typing import Tuple

import magic
import paho.mqtt.client as mqtt
import simpleaudio
from simpleaudio import PlayObject
from pydub import AudioSegment

from config import MqttConfig
from includes.file_types_map import extensions_to_mime, mime_to_extensions
from includes.exceptions import PiLitFileNotFound, PiLitInvalidFileType

delay: Decimal = 200 / 1000  # 200 milliseconds
DEFAULT_DELAY: Decimal = 200 / 1000
current_clip_parts: Tuple[str, int, int] = None
current_clip: AudioSegment = None
playback: PlayObject = None
mqtt_config: MqttConfig = MqttConfig()


def _get_abs_path(file_name: str) -> str:
    abs_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "media", file_name)
    )
    if not os.path.isfile(abs_path):
        raise PiLitFileNotFound("No music file by that name")
        exit()
    return abs_path


def _validate_file_type(abs_path: str) -> Tuple[bool, str]:
    mime_type = magic.from_file(abs_path, mime=True)
    if not mime_type:
        return False, "Unable to determine mime type"
    file_name_parts = abs_path.split(".")
    if len(file_name_parts) < 2:
        return False, f"No file extension for file {abs_path}"
    extension = file_name_parts[-1].lower()
    if extensions_to_mime[extension] == mime_type:
        return True, mime_type
    return False, "File type doesn't match its contents"


def load_clip(file_name: str, start_sec: int = 0, end_sec: int = 0) -> AudioSegment:
    abs_path = _get_abs_path(file_name=file_name)
    valid, msg = _validate_file_type(abs_path=abs_path)
    if not valid:
        raise PiLitInvalidFileType(msg)
    extension = abs_path.split(".")[-1]
    params = {"start_second": start_sec}
    if end_sec > 0:
        params["duration"] = abs(end_sec - start_sec)

    return AudioSegment.from_file(abs_path, format=extension, **params)


def extract_message_parts(msg) -> Tuple[str, int, int]:
    payload = str(msg.payload.decode("utf-8"))
    parts = payload.split(":")
    file_name = parts[0]
    start_sec = 0
    stop_ms = 0
    if len(parts) >= 2:
        try:
            start_sec = int(parts[1])
        except ValueError:
            # can't cast to int, leave start_sec=0
            pass
    if len(parts) >= 3:
        try:
            stop_ms = int(parts[2])
        except ValueError:
            # can't cast to int, leave stop_ms=0
            pass
    return file_name, start_sec, stop_ms


def on_connect(client, userdata, flags, rc):
    """
    MQTT callback function, called when this node connects to the server
    """
    if rc == 0:
        client.connected_flag = True
        print("Connected, return code = ", rc)
        for topic in mqtt_config.topics:
            client.subscribe(topic)
    else:
        print("Bad connection, return code = ", rc)


def on_message(client, userdata, message):
    """
    MQTT callback function, called when this node receives a message

    The message should be in form:  clip_name, start_ms, stop_ms
    """
    global current_clip_parts, current_clip, playback
    received_clip = extract_message_parts(message)
    clip_name, start_ms, stop_ms = received_clip
    if (
        clip_name.lower() == "stop"
        or clip_name.lower() == "off"
        and playback is not None
    ):
        playback.stop_all()
        return
    if (
        received_clip == current_clip_parts
        and playback is not None
        and playback.is_playing()
    ):
        # we got a repeated msg for the same clip and it's already playing
        return
    try:
        current_clip_parts = received_clip
        current_clip = load_clip(clip_name, start_ms, stop_ms)
        # play_buffer plays our audio clip
        playback = simpleaudio.play_buffer(
            current_clip.raw_data,
            num_channels=current_clip.channels,
            bytes_per_sample=current_clip.sample_width,
            sample_rate=current_clip.frame_rate,
        )
    except PiLitInvalidFileType as exc:
        print(exc.message)
    except PiLitFileNotFound as exc:
        print(exc.message)


def main():
    client = mqtt.Client(mqtt_config.client_name)
    client.on_connect = on_connect
    client.connect(mqtt_config.server_name)
    client.on_message = on_message
    client.loop_start()  # Start loop
    sleep(2)  # initial 2-sec sleep to make sure it's all up and running
    while True:
        # simple loop so that we don't exit
        sleep(delay)


if __name__ == "__main__":
    main()
