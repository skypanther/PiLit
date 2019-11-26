"""
Multi-relay controller for PiLit
Author: Tim Poulsen, @skypanther
License: MIT

This script runs on your Raspberry Pi, receives MQTT
messages, and turns on/off the relays to control a
multirelay board which works well for a (non-pixel
style) megatree.

Setup:

1. Make sure you have gpiozero installed on your Pi with:

> sudo apt-get update
> sudo apt-get install python3-gpiozero python-gpiozero

2. Update the gpio_pins list below with the pin numbers you're
using on your Pi. If you're using less than 16 pins, simply
delete any extra numbers from the sample line below.

   NOTE: You must use the BCM (Broadcom) numbers for the pins
   and NOT their physical pin numbers!

3. Update the system name, MQTT server name, and topics list to match
your setup.

4. Run the script and leave it running. 

"""

import math
import paho.mqtt.client as mqtt

from gpiozero import LED
from time import sleep

# CONFIGURE THESE VARIABLES TO SUIT YOUR ACTUAL SETUP #

######## GPIO PIN CONFIGURATION ########
# USE BCM (BROADCOM) NOT PHYSICAL PIN NUMBERS
# also don't use GPIO 14 / pin 8 on a Pi B+ as it's the "hard drive light" pin
gpio_pins =     [2, 3, 4, 7,  15, 17, 18, 27, 22, 23, 24, 10, 9,  25, 11, 8]
# physical_pins = [3, 5, 7, 26, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24]

######## MQTT/NETWORK CONFIGURATION ########
mqtt_server = "Tim-Poulsen-MBP15.local"  # IP address or name of the broker (server)
mqtt_name = "megatree"
mqtt_topics = [
    "all",
    "megatree"
]


# DON'T CHANGE BELOW HERE #
pins = []
pattern = [0] * len(gpio_pins)
num_pins = len(gpio_pins)
animation_name = "all_off"
delay = 200 / 1000  # 200 milliseconds
DEFAULT_DELAY = 200 / 1000

### DECORATOR FUNCTION ###
anims = {}
def anim(f):
    anims[f.__name__] = f
    return f


# Pattern functions, create a list of 1/0 values signifying which pins to turn on/off
# To set up, we create a new pattern. Then rotate() through it in steps, using the
# pattern to set the pins

@anim
def on():
    # Turns on all relays
    return [1] * num_pins

@anim
def off():
    # Turns off all relays
    return [0] * num_pins

@anim
def march_single():
    # [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    pattern = [0] * num_pins
    pattern[0] = 1
    return pattern

@anim
def march_single_inverted():
    # [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    pattern = [1] * num_pins
    pattern[0] = 0
    return pattern

@anim
def march_two_opposite():
    # [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    pattern = [0] * num_pins
    pattern[0] = 1
    pattern[math.ceil(len(pattern) / 2)] = 1
    return pattern

@anim
def march_two_opposite_inverted():
    # [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1]
    pattern = [1] * num_pins
    pattern[0] = 0
    pattern[math.ceil(len(pattern) / 2)] = 0
    return pattern

@anim
def march_four():
    # [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
    pattern = [0] * num_pins
    half = math.ceil(len(pattern) / 2)
    quarter = math.ceil(len(pattern) / 4)
    pattern[0] = 1
    pattern[quarter] = 1
    pattern[half] = 1
    pattern[quarter + half] = 1
    return pattern

@anim
def march_four_inverted():
    # [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
    pattern = [1] * num_pins
    half = math.ceil(len(pattern) / 2)
    quarter = math.ceil(len(pattern) / 4)
    pattern[0] = 0
    pattern[quarter] = 0
    pattern[half] = 0
    pattern[quarter + half] = 0
    return pattern

@anim
def alternate():
    # [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
    pattern = [0] * num_pins
    for i in range(num_pins):
        if i % 2 == 0:
            pattern[i] = 1
    return pattern


### FILL / OTHER PATTERNS NOT HANDLED AS ABOVE ###

# @anim
# def fill_up():
#     pass

# @anim
# def empty_out():
#     pass


### OPERATIONAL FUNCTIONS ###

def setup_pins():
    """
    Creates the LED instances for each of the pins to which
    you have relays connected and stores them in the pins list
    """
    for pin_number in gpio_pins:
        pins.append(LED(pin_number))

def rotate(l, n):
    """
    Rotate (shift) the list, moving values n places to the left/right
    """
    n = -n  # so that we step through the list in the correct direction
    return l[n:] + l[:n]

def set_pins():
    for idx, pin in enumerate(pins):
        if pattern[idx] == 1:
            pin.off()
        else:
            pin.on()

def on_connect(client, userdata, flags, rc):
    """
    MQTT callback function, called when this node connects to the server
    """
    if rc==0:
        client.connected_flag = True
        print("Connected, return code = ", rc)
        for topic in mqtt_topics:
            client.subscribe(topic)
    else:
        print("Bad connection, return code = ", rc)

def on_message(client, userdata, message):
    """
    MQTT callback function, called when this node receives a message

    The message should be in form:  pattern_name:delay
    """
    payload = str(message.payload.decode("utf-8"))
    global animation_name, delay, pattern
    if not ":" in payload:
        delay = DEFAULT_DELAY
        new_animation = payload
    else:
        parts = payload.split(":")
        new_animation = parts[0]
        delay = DEFAULT_DELAY if parts[1] is None else int(parts[1]) / 1000
    if new_animation != animation_name and new_animation in anims:
        # If this animation is different than the one currently running
        # and is a valid function name defined in this file ...
        animation_name = new_animation
        pattern = anims[new_animation]()  # put the new pattern in our global

def main():
    setup_pins()
    client = mqtt.Client(mqtt_name)
    client.on_connect = on_connect
    client.connect(mqtt_server)
    client.on_message = on_message
    client.loop_start()  #Start loop 
    sleep(2)
    global pattern
    while True:
        set_pins()
        pattern = rotate(pattern, 1)
        sleep(delay)

if __name__ == '__main__':
    main()
