/*
  ************************************************
  ALL CONFIGURATION IS DONE IN THIS FILE
  ************************************************
*/

// Change this to match the GPIO pin you're using
int relayGpioPin = 5;  // D1

char *hostname = "relay8";  // The hostname of this device -- eg. thishost.local
String topics[] = {         // Create an array of topics to subscribe to
    "all",                  // add as many topics as necessary
    "onoffnodes", "relay8"};
char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP
                                           // address of the MQTT broker
char *ssid = "SSID_WIFI_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

// UTC offset, -5 is EST
int utcOffsetInHours = -5;
int utcOffsetInSeconds = utcOffsetInHours * 60 * 60;

// Some base delay times
// Time (ms) between calls to loop(), probably best to leave as-is
uint16_t loopDelay = 10;
// Repeat the animations. If false, they complete once then stop
bool repeat = true;

int notConnectedMaxRetries = 20;