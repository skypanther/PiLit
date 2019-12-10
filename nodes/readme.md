# Nodes

Nodes are the lighting controllers. Currently, PiLit supplies 3 types of nodes:

* pixel_node -- (Arduino / ESP8266) used to control "neopixel" strips
* onoff_node -- (Arduino / ESP8266) used to control simple on/off relays
* multi_relay -- (Python / Raspberry Pi) used to control multi-relay boards

In general, for all three types of nodes, you will need to customize a few variables in each script before loading it onto your microcontroller/Pi.


## pixel_node

This node is to control "neopixel" strips. In my setup, I use a generic off-brand ESP8266 microcontroller, a level shifter, and APA102C or other LED strips or strings. I use these for leaping arches, pixel trees, and more.

### Configuration and installation

Open pixel_node.ino with the Arduino editor and customize the following values to match your setup:

```c++
// CHANGE THESE TO MATCH THE PIXEL TYPE AND SPECIFICS OF YOUR SETUP
#define LED_TYPE APA102
#define DATA_PIN 5
#define CLOCK_PIN 4
#define NUM_LEDS 92
#define COLOR_ORDER BGR
#define BRIGHTNESS 150

char *hostname = "arch1";                   // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "arches",
  "arch1"
};
char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *net1_ssid = "YOUR_WIFI_NET_NAME";
char *net1_password = "PASSWORD";
char *net2_ssid = "YOUR_WIFI_NET_NAME2";
char *net2_password = "PASSWORD";
```

Then, upload to your microcontroller. You can use the serial monitor to confirm that it connects to your network and subscribes to the channels (topics).

### Animation details

These node types listen for MQTT messages in this form:

```
<color>:<animation_type>:<loop_delay>:<hold_time>:<repeat>
```

Where:

* `color` is one of the valid color names below.
* `animation_type` is one of the valid animations below.
* `loop_delay` is a number of milliseconds, default is 10. Increasing this has the effect of slowing the animation.
* `hold_time` is a number of milliseconds, default is 50. Some animations, such as bounce, pause briefly when the moving light reaches the end of the strip. Changing `hold_time` changes this pause. Don't set it much above 300-500 ms though, or the animation gets all funky.
* `repeat` is either true (to repeat the animation until the next one is received) or false (to run it once)

For example:

```
red:bounce:5:50:true 
```

There are wo special forms of the command

```
topic off
topic reset
```

 Using `off` is the same as setting all LEDs to black and running the solid_color animation -- in other words the strip goes off. Using `reset` keeps whatever animation was running going, but resets the loop delay and hold times to their default values.

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

## onoff_node

This node is to control simple on/off relays. In my setup, I use these nodes to control spot lights, traditional holiday light strings, and other devices to be simply turned on or off.

Open onoff_node.ino with the Arduino editor and customize the following values to match your setup:

```c++
#define gpioPin 5                           // Change this to match the GPIO pin you're using
char *hostname = "spotlight1";              // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "onoffnodes",
  "spotlight1"
};
char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *net1_ssid = "YOUR_WIFI_NET_NAME";
char *net1_password = "PASSWORD";
char *net2_ssid = "YOUR_WIFI_NET_NAME2";
char *net2_password = "PASSWORD";
```

### Animation details

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

## multi_relay

I use this node type to control strings of "normal" Christmas lights on my megatree. I have a 16-relay Sainsmart board hooked up to 16 outlets into which those lights are plugged. This node turns them on and off in various patterns.

**Note** This script requires Python 3.6 or newer.

### Configuration and installation

Open multi_relay.py and customize the values shown below.

```python
######## GPIO PIN CONFIGURATION ########
# USE BCM (BROADCOM) NOT PHYSICAL PIN NUMBERS
# also don't use GPIO 14 / pin 8 on a Pi B+ as it's the "hard drive light" pin
gpio_pins =     [2, 3, 4, 7,  15, 17, 18, 27, 22, 23, 24, 10, 9,  25, 11, 8]
# physical_pins = [3, 5, 7, 26, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24]

######## MQTT/NETWORK CONFIGURATION ########
mqtt_server = "northpole.local"  # IP address or name of the broker (server)
mqtt_name = "megatree"
mqtt_topics = [
    "all",
    "megatree"
]
```

You will need to install the paho-mqtt and gpiozero packages to use the script. If Python 3 is not your system default, I recommend you use a virtual environment set to Python 3.

```
pip install paho-mqtt
pip install gpiozero
```

You will need to configure your Pi to connect automatically to your WiFi network. Using the GUI, simply connecting to WiFi will save your password (assuming Stretch or Buster). See the Raspbian docs to configure WiFi from the command line if you don't use the GUI. You won't need the GUI to run multi_relay.py

See the running_on_boot.md file in the multi_relay folder for information on one way to run the script when your Pi boots.
