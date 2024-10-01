"""
PiLit Player - the player for PiLit light show sequences

(c) 2019-2023 Tim Poulsen
MIT License

Usage:

    Edit the config.py file to specify the name of your mqtt_server
    See the readme for MQTT broker installation info
    Run with:
        python3 pilit_player.py <path/to/show_file_name.json>

Note: If you modify PiLit to add a new node type, you will need to
    update the `make_animation_command()` function in this file.
"""

import json
import os
import paho.mqtt.publish as publish
import sys
from datetime import datetime, timedelta
from time import sleep

# import config
from config import log, mqtt_server, show_loop_interval


# local vars
times_shutoff_cmd_sent = 0


def main():
    args = sys.argv[1:]
    if len(args) == 0:
        # prompt for show name
        show_name = input("Enter the show name: ")
    else:
        show_name = args[0]
    show_path = os.path.realpath(show_name)
    load_file(show_path)


def load_file(show_path):
    if not os.path.isfile(show_path):
        print("No show file by that name")
        exit()
    show_file = ""
    with open(show_path) as sp:
        show_file = json.load(sp)
    if validate_file(show_file=show_file):
        show = preprocess_file(show_file=show_file)
        run_show(show)


def validate_file(show_file) -> bool:
    if (
        show_file
        and show_file != ""
        and show_file["showName"] != ""
        and show_file["startTime"] != ""
        and show_file["stopTime"] != ""
        and show_file["channels"]
    ):
        # show is valid
        return True
    log("Show file is not a valid PiLit file.")
    raise Exception("Not a valid PiLit show file")


def preprocess_file(show_file):
    channels = []
    start_time, end_time = get_show_times(show_file)
    for channel in show_file["channels"]:
        sum_of_durations = 0
        channel_commands = []
        for animation in channel["animations"]:
            this_duration = int(animation["duration"])
            sum_of_durations += this_duration
            animation_command = make_animation_command(channel["type"], animation)
            channel_commands.append(
                (
                    channel["mqttName"],
                    animation_command,
                    sum_of_durations,
                    this_duration,
                )
            )
        channels.append(channel_commands)
    show = {"start_time": start_time, "end_time": end_time, "channels": channels}
    return show


def make_animation_command(type, animation):
    if type in ["PixelNode", "PixelTree", "SpheroNode"]:
        # These are the RGB LED type nodes
        anim = animation["animation"] if animation["animation"] != "" else "off"
        color = animation["color"] if animation["color"] != "" else "black"
        loopDelay = animation["loopDelay"] if animation["loopDelay"] != "" else "10"
        holdTime = animation["holdTime"] if animation["holdTime"] != "" else "50"
        repeatable = animation["repeatable"] if animation["repeatable"] else True
        return f"{color}:{anim}:{loopDelay}:{holdTime}:{repeatable}"
    elif type == "MultiRelayNode":
        # this is my megatree node, basically a 16-relay controller
        anim = animation["animation"] if animation["animation"] != "" else "off"
        loopDelay = animation["loopDelay"] if animation["loopDelay"] != "" else "10"
        return f"{anim}:{loopDelay}"
    elif type == "AudioNode":
        # obvs, this is the audio player
        # The message should be in form:  clip_name, start_ms, stop_ms
        anim = (
            animation["filename"] if animation["filename"] != "" else "stop"
        )  # off works too
        start_ms = animation["start_ms"] if animation["start_ms"] else 0
        stop_ms = (
            animation["stop_ms"] if animation["stop_ms"] else 0
        )  # 0 means to end of file
        return f"{anim}:{start_ms}:{stop_ms}"
    else:
        # These are the on/off type nodes - "OnOffNode", "MovinMax", "MotorinMax",
        # "ShellyNode", and also the "Santa Drop In" node, which is on/off and
        # automatically does the alternating between Drop and In being lit.
        anim = animation["animation"] if animation["animation"] != "" else "off"
        if type == "ShellyNode":
            anim = '{"method": "Switch.Set", "params":{"id":0,"on":false}}'
        return f"{anim}"


def get_show_times(show_file):
    start_time = show_file["startTime"].split(":")
    stop_time = show_file["stopTime"].split(":")
    return (
        (int(start_time[0]), int(start_time[1])),
        (int(stop_time[0]), int(stop_time[1])),
    )


def get_show_times_for_today(start_time, stop_time):
    st = datetime.today().replace(
        hour=start_time[0], minute=start_time[1], second=0, microsecond=0
    )
    if stop_time[0] <= 12:
        # we're stopping after midnight
        tomorrow = datetime.today() + timedelta(days=1)
        et = tomorrow.replace(
            hour=stop_time[0], minute=stop_time[1], second=59, microsecond=999999
        )
    else:
        et = datetime.today().replace(
            hour=stop_time[0], minute=stop_time[1], second=59, microsecond=999999
        )
    return st, et


def send_command(topic, payload, sum_of_durations, this_duration):
    # paho mqtt send command here
    dur_string = f"{this_duration} of {sum_of_durations} sec".ljust(16, " ")
    log(f"{topic.ljust(16, ' ')} {dur_string} --> {payload}")
    publish.single(topic, payload=payload, hostname=mqtt_server)


def lengths(x):
    # https://stackoverflow.com/a/30902673/292947
    # Find the longest list in a list of lists (recursive)
    # Usage: max(lengths(list_of_lists))
    if isinstance(x, list):
        yield len(x)
        for y in x:
            yield from lengths(y)


def get_longest_animation_sequence(channels_list):
    longest = (0, 0)
    for index, channel in enumerate(channels_list):
        num_anims = len(channel)
        if num_anims > longest[0]:
            longest = (num_anims, index)
    return longest


def run_show(show):
    most_animations_count, most_animations_index = get_longest_animation_sequence(
        show["channels"]
    )
    last_animation_in_longest_sequence = show["channels"][most_animations_index][
        most_animations_count - 1
    ]
    longest_animation_duration = last_animation_in_longest_sequence[2]
    mqtt_names = [channel[0][0] for channel in show["channels"]]
    animation_indexes = [0] * len(show["channels"])
    duration_counter = 0
    global times_shutoff_cmd_sent
    while True:
        current_time = datetime.now()
        show_start_time, show_stop_time = get_show_times_for_today(
            show["start_time"], show["end_time"]
        )
        if current_time > show_start_time and current_time < show_stop_time:
            times_shutoff_cmd_sent = 0
            duration_counter += show_loop_interval  # 0.5 seconds
            if duration_counter == show_loop_interval:
                # This is the first time through, so run the first animation in all channels
                log("***** Starting Show *****")
                for index, channel in enumerate(show["channels"]):
                    current_animation_index = animation_indexes[index]
                    mqtt_name, anim, sum_of_durations, this_duration = channel[
                        current_animation_index
                    ]
                    send_command(mqtt_name, anim, sum_of_durations, this_duration)
                    current_animation_index += 1
                    if current_animation_index >= len(channel):
                        current_animation_index = 0
                    animation_indexes[index] = current_animation_index
                continue
            for index, channel in enumerate(show["channels"]):
                current_animation_index = animation_indexes[index]
                mqtt_name, anim, sum_of_durations, this_duration = channel[
                    current_animation_index
                ]
                # print(mqtt_name, sum_of_durations, duration_counter, current_animation_index, len(channel))
                if duration_counter >= sum_of_durations:
                    send_command(mqtt_name, anim, sum_of_durations, this_duration)
                    current_animation_index += 1
                    if current_animation_index >= len(channel):
                        current_animation_index = 0
                    animation_indexes[index] = current_animation_index
            if duration_counter >= longest_animation_duration:
                duration_counter = 0
        else:
            animation_indexes = [0] * len(show["channels"])
            duration_counter = 0
            if times_shutoff_cmd_sent < 5:
                times_shutoff_cmd_sent += 1
                for mqtt_name in mqtt_names:
                    send_command(mqtt_name, "off", 0, 0)
            sleep(show_loop_interval * 10)
        sleep(show_loop_interval)


if __name__ == "__main__":
    main()
