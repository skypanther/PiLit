"""
Show Runner script for the PiLit holiday lighting controller
Author: Tim Poulsen, @skypanther
License: MIT

This script runs on your Raspberry Pi, reads in a show.json
file, and turns on/off the relays to perform your show.

Setup:

1. Make sure you have gpiozero installed on your Pi with:

> sudo apt-get update
> sudo apt-get install python3-gpiozero python-gpiozero

2. Update the board_pins list below with the pin numbers you're
using on your Pi. If you're using less than 16 pins, simply
delete any extra numbers from the sample line below

3. Run it (manually or from cron) with a command in the form:

> python3 runshow.py show.json HH:MM

  where show.json is the name of your show file (in same
  directory as this file) and HH:MM is the hours and minutes
  of when to end the show.

For example:

> python3 runshow.py show.json 22:30

Runs the show.json show till 10:30 PM tonight.

"""

import sys
from datetime import datetime
from time import sleep
import json
import os.path
from gpiozero import LED

# CONFIGURE THESE VARIABLES TO SUIT YOUR ACTUAL SETUP
# don't use pin 8 on a Pi B+ as it's the "hard drive light" pin
board_pins = [3, 5, 7, 26, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24]

# DON'T CHANGE THESE VARIABLES
midnight = datetime.today().replace(
    hour=23, minute=59, second=59, microsecond=999999)
args = sys.argv[1:]
pins = []


def main():
    if (len(args) == 0):
        # prompt for show name, duration
        show_name = input('Enter the show name: ')
        the_time = input('When should the show end? (time as HH:MM):')
        if "." not in show_name:
            show_name += ".json"
        if the_time == '':
            end_time = midnight
        else:
            end_time = format_end_time(the_time)
    elif (len(args) == 1 and args[0] == 'off'):
        # turn all lights off then exit
        all_off()
        exit()
    elif (len(args) == 1 and args[0] == 'on'):
        # turn all lights on then exit
        all_on()
        exit()
    elif (len(args) == 1):
        show_name = args[0]
        end_time = midnight
        if "." not in show_name:
            show_name += ".json"
    else:
        show_name = args[0]
        end_time = format_end_time(args[1])
        if "." not in show_name:
            show_name += ".json"
    if not os.path.isfile(show_name):
        print('No show file by that name')
        exit()
    run_show(show_name, end_time)


def run_show(show_name, end_time):
    # Runs the actual show
    with open(show_name) as json_file:
        show_file = json.load(json_file)
    if 'show' not in show_file:
        print('Bad show file')
        exit()
    show = show_file['show']
    delay = show_file['interval'] if 'interval' in show_file else 500
    delay = delay / 1000.0
    now = datetime.now()
    while now < end_time:
        for row in show:
            control_row(row)
            sleep(delay)
        now = datetime.now()


def format_end_time(the_time):
    # Formats an HH:MM time string into an actual datetime
    input_time = the_time.split(':')
    end_time = datetime.today().replace(
        hour=int(input_time[0]), minute=int(input_time[1]))
    return end_time


def all_on():
    # Turns on all relays
    for pin in pins:
        pin.on()


def all_off():
    # Turns off all relays
    for pin in pins:
        pin.off()


def control_row(row):
    """
    Turns on or off the relays for a specific row in the show file
    """
    if len(row) != len(pins):
        msg = '''
Error:
You must make sure the number of items in the board_pins
list in runshow.py is the same as each row in the show
list defined in your show.json file
'''
        sys.exit(msg)
    for index, relay_state in enumerate(row):
        if relay_state == 1:
            pins[index].on()
        else:
            pins[index].off()


def setup_pins():
    """
    Creates the LED instances for each of the pins to which
    you have relays connected and stores them in the pins list
    """
    for pin_number in board_pins:
        pins.append(LED(pin_number))


if __name__ == '__main__':
    setup_pins()
    main()
