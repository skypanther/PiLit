# PiLit Holiday Lighting System

The free, open source, DIY holiday light show animation system.

There are lots of commercial lighting systems and software. Most are more expensive than I care to pay. Or, the software doesn't do what I want in the way I want. Or, whatever. I'm a DIY'er and I built this system to scratch my itch.

<blockquote style="background-color: #ff000033; padding-top: 5pt; padding-bottom: 5pt;">
Warning: Building a PiLit system involves wiring and working with wall/mains voltage. You do so at your own risk. If you're not qualified to work with electricity, hire someone who is. Please be safe!
</blockquote>

## Design goals

PiLit goals:

* A show control application runs on a Raspberry Pi
* Which communicates over WiFi
* To "nodes" which are the lighting controllers in the yard.
* The nodes are either ESP8266/ESP32 microcontrollers or other Raspberry Pis.
* The nodes control RGB pixels (aka neopixels) or relays to turn on/off light strings, spotlights, etc.

A show generation app (PiLit GUI) is included to make creating show sequences relatively easy.


## Requirements

If you want to use this project for yourself, you will need some or all of the following:

* A Raspberry Pi (with WiFi) or other computer capable of running a Python script to use as your central controller.
* ESP8266 or other WiFi-enabled Arduino-compatible microcontrollers for controlling RGB pixels or relays.
* A Raspberry Pi (with WiFi) and a multi-channel relay board to control a mega tree of standard holiday lights.
* A bunch of outlets, electrical boxes, wire, connectors, etc.
* A pack of female-to-female jumpers (you'll find a bunch of [multipacks like this on Amazon](https://www.amazon.com/gp/product/B00JUKL4XI/ref=oh_aui_detailpage_o09_s00?ie=UTF8&psc=1))
* As many [1000 ohm resistors](https://www.amazon.com/gp/product/B0185FJ6L0/ref=oh_aui_detailpage_o09_s00?ie=UTF8&psc=1) as you have relays
* Something waterproof to house the final product since it will sit outside for the holiday season. I used a large storage tub.

## Usage

### Show creation

See the pilitgui folder for information on the show creation tool.

### Running a show

A Raspberry Pi 3B+ or newer makes a great show player computer. (You can probably use anything that can run Python and has WiFi.)

You will need to install Python 3.6.x or newer.

Copy the generated show JSON file to a convenient directory on your show computer.

Then, run the show with:

```
TBD
```

Leave this computer running 24x7 as long as you want your show to run. The show file includes start and stop times, during which your lighting sequences will run. All nodes will be set to `off` outside of those times, which should turn off all the lights provided you've wired things up correctly.