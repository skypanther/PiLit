// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION IS DONE IN THIS FILE
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// CHANGE THESE TO MATCH THE PIXEL TYPE AND SPECIFICS OF YOUR SETUP
#define LED_TYPE WS2812B
#define DATA_PIN 5
// #define CLOCK_PIN 4  // uncomment if using LEDs with a clock line, such as
// APA102C
#define NUM_LEDS 300
#define COLOR_ORDER GRB
#define BRIGHTNESS 100

// #define MAX_MILLIAMPS 5000  // 5 amps, uncomment if you want to set a max
// current draw

// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname =
    "archball";      // The hostname of this device -- eg. thishost.local
String topics[] = {  // Create an array of topics to subscribe to
    "all",           // add as many topics as necessary
    "arch", "archball"};

// HOSTNAME OR IP ADDRESS OF YOUR MQTT BROKER (SERVER)
char *brokerHostname = "northpole.local";

char *ssid = "SSID_WIFI_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

int utcOffsetInHours = -5;  // EST

// Some base delay times
uint16_t loopDelay = 10;  // Time (ms) between calls to animation function
uint16_t holdTime = 50;   // Time (ms) delay at the end of some back-n-forth
                          // functions (e.g. bounce)
// Repeat the animations. If false, they complete once then stop
bool repeat = true;