// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION IS DONE IN THIS FILE
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Change this to match the GPIO pins you're using
#define relay1GpioPin 5  // D1
#define relay2GpioPin 4  // D2

char *hostname = "dropin";  // The hostname of this device -- eg. thishost.local
String topics[] = {         // Create an array of topics to subscribe to
    "all",                  // add as many topics as necessary
    "onoffnodes", "dropin"};

char *brokerHostname = "192.168.0.100";

char *ssid = "NETWORK_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

// UTC offset, -5 is EST
int utcOffsetInHours = -5;

// Time (ms) between calls to currentAnimation() inside loop(). Increase or
// decrease to change the time alternating between "Drop" and "In" being lit
uint16_t loopDelay = 1000;
