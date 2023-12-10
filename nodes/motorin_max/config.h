// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION IS DONE IN THIS FILE
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Change this to match the GPIO pins you're using
#define motorEnA 14           // D5
#define motorControllerIn1 4  // D2
#define motorControllerIn2 5  // D1
#define switchOne 13          // D7
#define switchTwo 12          // D6


// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
// The hostname of this device -- eg. thishost.local
char *hostname = "motorinmax";
String topics[] = {  // Create an array of topics to subscribe to
  "all",             // add as many topics as necessary
  "motorinmax"
};
// Hostname or IP of the MQTT broker (aka, server)
char *brokerHostname = "192.168.0.100";

char *ssid = "NETWORK_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

int motor_speed = int(255 * 0.75);  // PWM value that controls motor speed

// UTC offset, -5 is EST
int utcOffsetInHours = -5;

// Some base delay times
// Time (ms) between calls to loop(), probably best to leave as-is
uint16_t loopDelay = 200;
// Repeat the animations. If false, they complete once then stop
bool repeat = true;

// switch-related config values
uint16_t debounceWaitTime = 200;       // ms
uint16_t ignoreSameSwitchTime = 2000;  // ms  // not yet implemented