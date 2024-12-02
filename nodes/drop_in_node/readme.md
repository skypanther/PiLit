# Drop-in Node

I built a "Santa, Drop In" sign that alternates between two states. Half lights in one state, the other in the second state. This node is basically a copy of the on-off node with a tweak or two. (Mostly it's so I know what sketch to upload to the controller should I need to do so again.)

Open config.h with the Arduino editor and customize the following values to match your setup:

```c++
#define gpioPin 5                           // Change this to match the GPIO pin you're using
char *hostname = "dropin";              // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "onoffnodes",
  "dropin"
};
char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *ssid = "NETWORK_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

```
