"""
Multi-relay test script for PiLit
Author: Tim Poulsen, @skypanther
License: MIT

Use this script to make sure you have the correct relays turning on as expected.
I wrote this to be sure I had GPIO pins on the Pi connected to the correct pins
on the Sainsmart board.

Plug a light into each of your sockets. Run this script. It will turn on the
outlets, one by one, with a 2-second pause for each outlet so that you can be
sure you've got things hooked up correctly.

"""

from gpiozero import LED
from time import sleep

# CONFIGURE THESE VARIABLES TO SUIT YOUR ACTUAL SETUP #

######## GPIO PIN CONFIGURATION ########
# USE BCM (BROADCOM) NOT PHYSICAL PIN NUMBERS
# also don't use GPIO 14 / pin 8 on a Pi B+ as it's the "hard drive light" pin
gpio_pins =     [2, 3, 4, 7,  15, 17, 18, 27, 22, 23, 24, 10, 9,  25, 11, 8]
physical_pins = [3, 5, 7, 26, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24]

# DON'T CHANGE BELOW HERE #
pins = []
pattern = [0] * len(gpio_pins)
pattern[0] = 1
num_pins = len(gpio_pins)
delay = 2  # seconds

def all_off():
    # Turns off all relays
    return [0] * num_pins

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
    return l[n:] + l[:n]

def set_pins():
    for idx, pin in enumerate(pins):
        if pattern[idx] == 1:
            print(f"Physical pin: {physical_pins[idx]} / GPIO pin: {gpio_pins[idx]} is ON")
            pin.on()
        else:
            pin.off()


def main():
    setup_pins()
    all_off()
    global pattern
    while True:
        set_pins()
        pattern = rotate(pattern, 1)
        sleep(delay)

if __name__ == '__main__':
    main()
