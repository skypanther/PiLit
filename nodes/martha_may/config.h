// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION IS DONE IN THIS FILE
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// CHANGE THESE TO MATCH THE PIXEL TYPE AND SPECIFICS OF YOUR SETUP
#define LED_TYPE WS2812B
#define DATA_PIN 5
// #define CLOCK_PIN 4  // uncomment if using LEDs with a clock line, such as
// APA102C
#define NUM_LEDS 100
#define COLOR_ORDER GRB
#define BRIGHTNESS 64

// Animation-specific variables
float delta;
uint8_t count = 0;

// Mess with these values for fill speed and slowing effect.
uint8_t fill_delay = 1;         // Increase to slow fill rate.
float delay_base = 1.06;        // Used to add a delay as strip fills up.
float delay_multiplier = 1.03;  // Used to add a delay as strip fills up.
/*  Set delays to 1.0 if you don't want any slowing.  These numbers need to
    be tuned visually based on your preference and also based on the number
    of pixels in your strip.
    These values looked good to me with a 32 pixel strip.  Small changes can
    make a large difference so try small increments.
*/

// Time (ms) between calls to currentAnimation() inside loop(). Increase or
// decrease to change the time alternating between "Drop" and "In" being lit
uint16_t loopDelay = 10;

// Time to show all the pixels "filled" before resetting and starting over
uint16_t holdDelay = 2000;

char *hostname =
  "martha_may";      // The hostname of this device -- eg. thishost.local
String topics[] = {  // Create an array of topics to subscribe to
  "all",             // add as many topics as necessary
  "onoffnodes", "martha_may"
};

char *brokerHostname = "192.168.0.100";

char *ssid = "NETWORK_NAME";
char *password = "PASSWORD";
char *ota_password = "PASSWORD";  // password for OTA updates

// UTC offset, -5 is EST
int utcOffsetInHours = -5;
