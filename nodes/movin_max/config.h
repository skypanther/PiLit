// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION IS DONE IN THIS FILE
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Change this to match the GPIO pin you're using
#define relay1GpioPin 5        // D1
#define relay2GpioPin 4        // D2
#define relay3GpioPin 14       // D5
#define relay4GpioPin 12       // D6
#define motorControllerIn1 15  // D8
#define motorControllerIn2 13  // D7
#define toggleGpioPin 1        // D10

// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname =
    "movinmax";      // The hostname of this device -- eg. thishost.local
String topics[] = {  // Create an array of topics to subscribe to
    "all",           // add as many topics as necessary
    "movinmax"};
char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP
                                           // address of the MQTT broker
char *ssid = "NETWORK_SSID";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

int motor_speed = int(255 * 0.75);  // PWM value that controls motor speed

// UTC offset, -5 is EST
int utcOffsetInHours = -5;

// Some base delay times
// Time (ms) between calls to loop(), probably best to leave as-is
uint16_t loopDelay = 1000;
// Repeat the animations. If false, they complete once then stop
bool repeat = true;
