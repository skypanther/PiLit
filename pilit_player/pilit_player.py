"""
PiLit Player - the player for PiLit light show sequences

(c) 2019 Tim Poulsen
MIT License

Usage:

    python3 pilit_player.py <show_file_name.json>

"""

import json
import os
import paho.mqtt.publish as publish
import sys
from datetime import datetime
from time import sleep

mqtt_server = "Tim-Poulsen-MBP15.local"
show_loop_interval = 0.5  # seconds
logging_enabled = True

def main():
    if (len(args) == 0):
        # prompt for show name
        show_name = input('Enter the show name: ')
    else:
        show_name = args[0]
    show_path = os.path.realpath(show_name)
    load_file(show_path)

def load_file(show_path):
    if not os.path.isfile(show_path):
        print('No show file by that name')
        exit()
    show_file = ""
    with open(show_path) as sp:
        show_file = json.load(sp)
    validate_file(show_file)

def validate_file(show_file):
    if show_file and
       show_file != "" and
       show_file["showName"] != "" and
       show_file["startTime"] != "" and
       show_file["stopTime"] != "" and
       show_file["channels"]:
        # show is valid
        preprocess_file(show_file)
        return
    print("Show file is not a valid PiLit file.")
    exit()

def preprocess_file(show_file):
    channels = []
    start_time, end_time = get_show_times(show_file)
    for channel in show_file["channels"]:
        sum_of_durations = 0
        channel_commands = []
        for animation in channel["animations"]:
            sum_of_durations = sum_of_durations + int(animation["duration"])
            animation_command = make_animation_command(channel["type"], animation)
            channel_commands.append( (channel["mqttName"], animation_command, sum_of_durations) )
        channels.append(channel_commands)
    show = {
        start_time: start_time,
        end_time: end_time,
        channels: channels
    }
    run_show(show)

def make_animation_command(type, animation):
    # types: PixelNode, OnOffNode, MegaTree
    if type == "PixelNode":
        anim = animation['animation'] if animation['animation'] != "" else "off"
        color = animation['color'] if animation['color'] != "" else "black"
        loopDelay = animation['loopDelay'] if animation['loopDelay'] != "" else "10"
        holdTime = animation['holdTime'] if animation['holdTime'] != "" else "50"
        repeatable = animation['repeatable'] if animation['repeatable'] else True
        return f"{color}:{anim}:{loopDelay}:{holdTime}:{repeatable}"
    if type == "OnOffNode":
        anim = animation['animation'] if animation['animation'] != "" else "off"
        return f"{anim}"
    if type == "MegaTree":
        anim = animation['animation'] if animation['animation'] != "" else "off"
        delay = animation['delay'] if animation['delay'] != "" else "10"
        return f"{anim}:{delay}"
    return "off"

def get_show_times(show_file):
    start_time = show_file["startTime"].split(':')
    stop_time = show_file["stopTime"].split(':')
    return ( (int(start_time[0]), int(start_time[1])), (int(stop_time[0]), int(stop_time[1])) )

def get_show_times_for_today(start_time, stop_time):
    st = datetime.today().replace(hour=start_time[0], minute=start_time[1], second=0, microsecond=0)
    if stop_time <= 12:
        # we're stopping after midnight
        tomorrow = datetime.today() + datetime.timedelta(days=1)
        et = tomorrow.replace(hour=stop_time[0], minute=stop_time[1], second=59, microsecond=999999)
    else:
        et = datetime.today().replace(hour=stop_time[0], minute=stop_time[1], second=59, microsecond=999999)
    return st, et

def log(msg):
    if logging_enabled:
        print(msg)

def send_command(topic, payload):
    # paho mqtt send command here
    log(f"{topic} --> {payload}")
    publish.single(topic, payload=payload, hostname=mqtt_server)

def lengths(x):
    # https://stackoverflow.com/a/30902673/292947
    # Find the longest list in a list of lists (recursive)
    # Usage: max(lengths(list_of_lists))
    if isinstance(x,list):
        yield len(x)
        for y in x:
            yield from lengths(y)

def run_show(show):
    max_animations_length = max(lengths(show.channels))  # find the length of the longest list of animations
    mqtt_names = [channel[0][0] for channel in show.channels]
    while True:
        current_time = datetime.now()
        show_start_time, show_stop_time = get_show_times_for_today(show.start_time, show.end_time)
        while current_time > show_start_time and current_time < show_stop_time:
            duration_counter = 0
            for i in range(max_animations_length):
                duration_counter += show_loop_interval
                for channel in show.channels:
                    channel_mqtt_name = channel[0]["mqtt_name"]
                    if channel[i] is not None:
                        mqtt_name, anim, sum_of_durations = channel[i]
                        if duration_counter >= sum_of_durations:
                            send_command(mqtt_name, anim)
                    else:
                        send_command(channel_mqtt_name, "off")
                time.sleep(show_loop_interval)
            time.sleep(show_loop_interval)
            current_time = datetime.now()
        # while the show is not running, send "off" to all nodes to be sure they're off
        for mqtt_name in mqtt_names:
            send_command(mqtt_name, "off")
        time.sleep(show_loop_interval * 10)

if __name__ == '__main__':
    main()