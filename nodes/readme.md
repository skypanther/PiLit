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
topic off
topic reset
```

Where:

* `topic` is the MQTT topic, such as all, leaping\_arches, spiral\_tree, etc.
* `color` is one of the valid color names below.
* `animation_type` is one of the valid animations below.
* `loop_delay` is a number of milliseconds, default is 10. Increasing this has the effect of slowing the animation.
* `hold_time` is a number of milliseconds, default is 50. Some animations, such as bounce, pause briefly when the moving light reaches the end of the strip. Changing `hold_time` changes this pause. Don't set it much above 300-500 ms though, or the animation gets all funky.

Two special forms of the command are `off` and `reset`. Using `off` is the same as setting all LEDs to black and running the solid_color animation -- in other words the strip goes off. Using `reset` keeps whatever animation was running going, but resets the loop delay and hold times to their default values.

**Valid color names:** white, snow, silver, gray, grey, darkgray, darkgrey, black, red, crimson, darkmagenta, darkred, magenta, maroon, orange, orangered, darkorange, yellow, gold, green, lime, darkgreen, forestgreen, cyan, darkcyan, blue, deepskyblue, royalblue, skyblue, darkblue, navy, blueviolet, purple, violet, indigo, darkviolet

**Valid animation names:** 

* solid_color -- turn all LEDs to a single color
* center_out -- LEDs light up, one-by-one, from the center towards the end till the whole strip is on
* edges_in -- LEDs light up, one-by-one, from two ends towards the center till the whole strip is on
* slinky -- LEDs light up, one-by-one, starting from end closest to the microcontroller towards the other end till the whole strip is on
* slinky_backwards -- LEDs light up, one-by-one, starting from end furthest from the microcontroller towards the other end till the whole strip is on
* bounce -- 3 LEDs light up, then move as a group to the other end with the rest of the LEDs all off. Once they reach the far end, they move back towards the beginning.
* bounce_backwards -- Same as bounce, starting from opposite end
* circle -- 3 LEDs light up, then move as a group to the other end with the rest of the LEDs all off. Once they reach the far end, they start over from the original end
* circle_backwards -- Same as circle, starting from the opposite end
* flash -- Whole strip lights up at full brightness, then fades to black
* rainbow -- A moving, blended (continuous) rainbow pattern fills the entire strip (*see note*)
* rainbow_stripes -- Like rainbow, but with discrete stripes of rainbow colors separated by black (*see note*)
* ocean -- A moving, blended (continuous) pattern of blues, greens, and white fills the entire strip (*see note*)
* stripes -- Multiple discrete stripes of a single color travel down the strip with black between
* stripes_white -- Multiple discrete stripes of a single color travel down the strip with white between

NOTE: You must supply a color parameter when using the rainbow, rainbow_stripes, and ocean animations even though that color will be ignored. Also note that the animations will move quite slowly at the default loop_delay time. Best effect will be achieved with a loop_delay between 1 - 10.

**Examples (using command-line mosquitto tool)**

(Where 192.168.1.10 is the mosquitto broker/server, `publisher` is the MQTT name of the station publishing the command, and `arches` is the topic name.)

```
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'blue:slinky'
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'crimson:slinky:20:250'
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'red:rainbow:3'
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'reset'
mosquitto_pub -h 192.168.1.10 -i publisher -t arches -m 'off'

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

