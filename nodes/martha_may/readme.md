# Martha May

I built a Martha May figure and light-gun cutout. I use a couple of strings of addressable LEDs. This node's animation "shoots" white lights down the string which "fills up"; once full, it clears and repeats. This gives the effect of Martha May shooting lit Christmas lights onto the eaves of her house as she does in the movie.

Open config.h with the Arduino editor and customize the following values to match your setup:

```c++
#define gpioPin 5                           // Change this to match the GPIO pin you're using
char *hostname = "martha_may";              // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "onoffnodes",
  "martha_may"
};

char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *ssid = "NETWORK_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

```
