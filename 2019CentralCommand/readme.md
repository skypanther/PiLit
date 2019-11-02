# 2019 Rewrite - Central Command

Goals for this year's rewrite are:

* Central Raspberry Pi controls multiple nodes
* The various nodes control the actual devices - relays, pixel strips, eventually sound
* Uses MQTT to send messages from the central Pi to the nodes



## Nodes

These are the Arduino / ESP8266 programs used to control the actual light displays in the yard. Each is an MQTT subscriber / client that accepts various commands which control how the lights are displayed.

### pixel_node

This node is to control "neopixel" strips. In my setup, I use a generic off-brand ESP8266 microcontroller, a level shifter, and APA102C or other LED strips or strings. I use these for leaping arches, pixel trees, and more.

These node types accept these MQTT messages in this form:

```
topic color:animation_type:loop_delay:hold_time
```

Where:

* `topic` is the MQTT topic, such as all, leaping\_arches, spiral\_tree, etc.
* `color` is one of the valid color names below.
* `animation_type` is one of the valid animations below.
* `loop_delay` is a number of milliseconds, default is 10. Increasing this has the effect of slowing the animation.
* `hold_time` is a number of milliseconds, default is 50. Some animations, such as bounce, pause briefly when the moving light reaches the end of the strip. Changing `hold_time` changes this pause. Don't set it much above 300-500 ms though, or the animation gets all funky.

**Valid color names:** white, snow, silver, gray, grey, darkgray, darkgrey, black, red, crimson, darkmagenta, darkred, magenta, maroon, orange, orangered, darkorange, yellow, gold, green, lime, darkgreen, forestgreen, cyan, darkcyan, blue, deepskyblue, royalblue, skyblue, darkblue, navy, blueviolet, purple, violet, indigo, darkviolet

**Valid animation names:** 

* solid_color -- turn all LEDs to a single color
* center_out -- LEDs light up, one-by-one, from the center towards the end till the whole strip is on
* edges_in -- LEDs light up, one-by-one, from two ends towards the center till the whole strip is on
* slinky -- LEDs light up, one-by-one, starting from end closest to the microcontroller towards the other end till the whole strip is on
* slinky_backwards -- LEDs light up, one-by-one, starting from end furthest from the microcontroller towards the other end till the whole strip is on
* bounce -- 3 LEDs light up, then move as a group to the other end with the rest of the LEDs all off. Once they reach the far end, they move back towards the beginning.

**Examples (using command-line mosquitto tool)**

(Where 192.168.1.10 is the mosquitto broker/server, `publisher` is the MQTT name of the station publishing the command, and `arches` is the topic name.)

```
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'blue:slinky'
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'blue:slinky:20:250'
```

### onoff_node

This node is to control simple on/off relays. In my setup, I use these nodes to control spot lights, traditional holiday light strings, and other devices to be simply turned on or off.

These node types accept these MQTT messages in this form:

```
topic command
```

Where:

* `topic` is the MQTT topic, such as all, spotlight1, etc.
* `command` is one of `on`, `off`, or `toggle`

**Examples (using command-line mosquitto tool)**

(Where 192.168.1.10 is the mosquitto broker/server, `publisher` is the MQTT name of the station publishing the command, and `spotlight1` is the topic name.)

```
mosquitto_pub -h 192.168.1.10 -i publisher -t spotlight -m 'on'
```

