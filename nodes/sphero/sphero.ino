/*
   ESP8266 code to control RGB pixel strips
    - Network connection code
    - MQTT subscriber code
    - FastLED based pixel control code


  TODO:

  - From the FastLED ColorPalette demo, add:
    currentPalette = RainbowColors_p;         currentBlending = LINEARBLEND
    currentPalette = RainbowStripeColors_p;   currentBlending = NOBLEND
    SetupBlackAndWhiteStripedPalette();       currentBlending = NOBLEND  <-- make work with current color
    currentPalette = OceanColors_p;           currentBlending = NOBLEND

*/

// #define FASTLED_ESP8266_RAW_PIN_ORDER
#define FASTLED_ESP8266_RAW_PIN_ORDER
//#define FASTLED_ESP8266_NODEMCU_PIN_ORDER

#include <string>
#include <unordered_map>

#include <FastLED.h>

#include "utils.h"
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266mDNS.h>
#include <PubSubClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <WiFiServerSecure.h>
#include <WiFiUdp.h>
#define MAX_MESSAGE_LENGTH 128

// CHANGE THESE TO MATCH THE PIXEL TYPE AND SPECIFICS OF YOUR SETUP
#define LED_TYPE WS2812B
#define DATA_PIN 5
#define CLOCK_PIN 4
#define NUM_LEDS 300
#define COLOR_ORDER GRB
#define BRIGHTNESS 100
//#define MAX_MILLIAMPS 10000  // 12 amps

// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname = "archball"; // The hostname of this device -- eg. thishost.local
String topics[] = {          // Create an array of topics to subscribe to
    "all",                   // add as many topics as necessary
    "arch",
    "archball"};
char *brokerHostname = "northpole.local"; // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *net1_ssid = "WIFI_NETWORK_SSID";
char *net1_password = "PASSWORD";

// Some base delay times
uint16_t loopDelay = 10; // Time (ms) between calls to animation function
uint16_t holdTime = 50;  // Time (ms) delay at the end of some back-n-forth functions (e.g. bounce)
bool repeat = true;      // Repeat the animations. If false, they complete once then stop

// XXXXXXXXXX  DON'T CHANGE ANYTHING BELOW THIS IN THIS FILE  XXXXXXXXXX

CRGB realleds[NUM_LEDS];
CRGBArray<NUM_LEDS> leds;
CRGBSet spoke0(leds(0, 49));
CRGBSet spoke1(leds(50, 99));
CRGBSet spoke2(leds(100, 149));
CRGBSet spoke3(leds(150, 199));
CRGBSet spoke4(leds(200, 249));
CRGBSet spoke5(leds(250, 299));
std::array<CRGBSet, 6> spokes = {spoke0, spoke1, spoke2, spoke3, spoke4, spoke5};
uint16_t LEDS_PER_SPOKE = 50;
uint16_t num_spokes = 6;

struct NetworkData
{
  char *ssid;
  char *password;
};

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;

char valid_colors[] = "white snow silver gray grey darkgray darkgrey black red crimson darkmagenta darkred magenta maroon orange orangered darkorange yellow gold green lime darkgreen forestgreen cyan darkcyan blue deepskyblue royalblue skyblue darkblue navy blueviolet purple violet indigo darkviolet";
char valid_functions[] = "solid_color center_out edges_in slinky slinky_backwards bounce circle circle_backwards flash rainbow rainbow_stripes stripes stripes_white ocean spin_1 spin_1_backwards spin_2 spin_2_backwards hemi_spin hemi_spin_backwards";
/*
palettes:
  - rainbow
  - rainbow_stripes
  - ocean
horizontal patterns:
  one color param:
    - solid_color
  two color params:
    - spin_1: all spokes background_color, one foreground_color, advances spoke to spoke around the sphere
    - spin_2: all spokes background_color, opposite two foreground_color, advances spoke to spoke around the sphere
    - hemisphere: half one color, half the other, advances around sphere (set no repeat to get static half-n-half)
vertical patterns:
  one color param:
    - fill-down: spokes fill with color, top-down
    - fill-up: spokes fill with color, top-up
    - center_out
    - edges_in
    - slinky
    - slinky_backwards
    - bounce
    - circle
    - circle_backwards
    - flash

*/
char delim[] = ":";
std::function<void(void)> currentAnimation;
int16_t ledOnePosition = 0;   // Set initial start position of Red pixel
int16_t ledTwoPosition = 1;   // Set initial start position of White pixel
int16_t ledThreePosition = 2; // Set initial start position of Blue pixel
int8_t delta = 1;             // Using a negative value will move pixels backwards.

int16_t slinkyPosition = 1;
int16_t edgesCenterPosition = 0;
int16_t spokeMidPoint = (int16_t)std::round((float)LEDS_PER_SPOKE / 2);

char *current_color = "black";
char *current_background_color = "black";
CRGB currentColor = CRGB::Black;
CRGB currentBackgroundColor = CRGB::Black;
char *current_function = "solid_color";
uint16_t origLoopDelay = 10;
uint16_t origHoldTime = 50;
bool doneTheNonRepeatingAnimationOnce = false;

CRGBPalette16 currentPalette;
TBlendType currentBlending;

//
// Lookup table of colors - to convert string to CRGB reference
//
std::unordered_map<std::string, CRGB> colorTable = {
    {"white", CRGB::White},
    {"snow", CRGB::Snow},
    {"silver", CRGB::Silver},
    {"gray", CRGB::Gray},
    {"grey", CRGB::Grey},
    {"darkgray", CRGB::DarkGray},
    {"darkgrey", CRGB::DarkGrey},
    {"black", CRGB::Black},

    {"red", CRGB::Red},
    {"crimson", CRGB::Crimson},
    {"darkmagenta", CRGB::DarkMagenta},
    {"darkred", CRGB::DarkRed},
    {"magenta", CRGB::Magenta},
    {"maroon", CRGB::Maroon},

    {"orange", CRGB::Orange},
    {"orangered", CRGB::OrangeRed},
    {"darkorange", CRGB::DarkOrange},

    {"yellow", CRGB::Yellow},
    {"gold", CRGB::Gold},

    {"green", CRGB::Green},
    {"lime", CRGB::Lime},
    {"darkgreen", CRGB::DarkGreen},
    {"forestgreen", CRGB::ForestGreen},

    {"cyan", CRGB::Cyan},
    {"darkcyan", CRGB::DarkCyan},

    {"blue", CRGB::Blue},
    {"deepskyblue", CRGB::DeepSkyBlue},
    {"royalblue", CRGB::RoyalBlue},
    {"skyblue", CRGB::SkyBlue},
    {"darkblue", CRGB::DarkBlue},
    {"navy", CRGB::Navy},

    {"blueviolet", CRGB::BlueViolet},
    {"purple", CRGB::Purple},
    {"violet", CRGB::Violet},
    {"indigo", CRGB::Indigo},
    {"darkviolet", CRGB::DarkViolet},
};

//
// Helper functions
//

void set_color(char *colorName)
{
  if (colorTable.count(colorName) > 0)
  {
    currentColor = colorTable[colorName];
  }
}

void FillLEDsFromPaletteColors(uint8_t colorIndex)
{
  for (int i = 0; i < LEDS_PER_SPOKE; i++)
  {
    for (const auto &spk : spokes)
    {
      spk[i] = ColorFromPalette(currentPalette, colorIndex, BRIGHTNESS, currentBlending);
    }
    colorIndex += 3;
  }
}

//
// LED pattern functions
//
void solid_color()
{
  //  log("setting solid color ", false);
  //  log(current_color);
  FastLED.showColor(currentColor);
}

void center_out()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    edgesCenterPosition = 0;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < LEDS_PER_SPOKE; j++)
  {
    for (int i = 0; i < LEDS_PER_SPOKE; i++)
    {
      if (i <= edgesCenterPosition || i >= LEDS_PER_SPOKE - (edgesCenterPosition + 1))
      {
        for (const auto &spk : spokes)
        {
          spk[i] = CRGB::Black;
        }
      }
      else
      {
        for (const auto &spk : spokes)
        {
          spk[i] = currentColor;
        }
      }
    }
    FastLED.show();

    edgesCenterPosition = edgesCenterPosition + delta;

    if (edgesCenterPosition > LEDS_PER_SPOKE / 2 + 1)
    {
      // log("Reverse ... towards pos 0");
      edgesCenterPosition -= 1;
      delta = -1;
      //      delay(holdTime);
    }
    else if (edgesCenterPosition < -1)
    {
      // log("Forward we go!");
      edgesCenterPosition += 1;
      delta = 1;
      delay(holdTime);
    }
    delay(loopDelay);
  }
}

void edges_in()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    edgesCenterPosition = 0;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < LEDS_PER_SPOKE; j++)
  {
    for (int i = 0; i < LEDS_PER_SPOKE; i++)
    {
      if (i <= edgesCenterPosition || i >= LEDS_PER_SPOKE - (edgesCenterPosition + 1))
      {
        for (const auto &spk : spokes)
        {
          spk[i] = currentColor;
        }
      }
      else
      {
        for (const auto &spk : spokes)
        {
          spk[i] = CRGB::Black;
        }
      }
    }
    FastLED.show();

    edgesCenterPosition = edgesCenterPosition + delta;

    if (edgesCenterPosition > LEDS_PER_SPOKE / 2 + 1)
    {
      // log("Reverse ... towards pos 0");
      edgesCenterPosition -= 1;
      delta = -1;
      delay(holdTime);
    }
    else if (edgesCenterPosition < -1)
    {
      // log("Forward we go!");
      edgesCenterPosition += 1;
      delta = 1;
      //      delay(holdTime);
    }
    delay(loopDelay);
  }
}

void slinky_backwards()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    slinkyPosition = LEDS_PER_SPOKE;
    delta = -1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < LEDS_PER_SPOKE; j++)
  {
    for (int i = 0; i < LEDS_PER_SPOKE; i++)
    {
      if (i > slinkyPosition)
      {
        for (const auto &spk : spokes)
        {
          spk[i] = currentColor;
        }
      }
      else
      {
        for (const auto &spk : spokes)
        {
          spk[i] = CRGB::Black;
        }
      }
    }
    FastLED.show();

    if (slinkyPosition == LEDS_PER_SPOKE - 1)
    {
      // log("Reverse ... towards pos 0");
      delta = -1;
      delay(holdTime);
    }
    else if (slinkyPosition == 0)
    {
      // log("Forward we go!");
      delta = 1;
      delay(holdTime);
    }
    slinkyPosition = (slinkyPosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
    delay(loopDelay);
  }
}

void slinky()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    slinkyPosition = 1;
    delta = 1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < LEDS_PER_SPOKE; j++)
  {
    for (int i = 0; i < LEDS_PER_SPOKE; i++)
    {
      if (i <= slinkyPosition)
      {
        for (const auto &spk : spokes)
        {
          spk[i] = currentColor;
        }
      }
      else
      {
        for (const auto &spk : spokes)
        {
          spk[i] = CRGB::Black;
        }
      }
    }
    FastLED.show();

    if (slinkyPosition == LEDS_PER_SPOKE - 1)
    {
      // log("Reverse ... towards pos 0");
      delta = -1;
      delay(holdTime);
    }
    else if (slinkyPosition == 0)
    {
      // log("Forward we go!");
      delta = 1;
      delay(holdTime);
    }
    slinkyPosition = (slinkyPosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
    // delay(loopDelay);
  }
}

void bounce()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    ledOnePosition = 0;
    ledTwoPosition = 1;
    ledThreePosition = 2;
    delta = 1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (const auto &spk : spokes)
  {
    // Set pixel colors, first, set all to black
    fill_solid(spk, LEDS_PER_SPOKE, CRGB::Black);
    // Then set the colors in the appropriate spots
    spk[ledOnePosition] = currentColor;
    spk[ledTwoPosition] = currentColor;
    spk[ledThreePosition] = currentColor;
  }
  // Finally show the pixels
  FastLED.show();

  // Set new position, moving (forward or backward) by delta.
  // LEDS_PER_SPOKE is added to the position before doing the modulo
  // to cover cases where delta is a negative value.
  if (ledTwoPosition == LEDS_PER_SPOKE - 1)
  {
    // log("Reverse ... towards pos 0");
    delta = -1;
  }
  else if (ledThreePosition == 1)
  {
    // log("Forward we go!");
    delta = 1;
  }
  ledOnePosition = (ledOnePosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
  ledTwoPosition = (ledTwoPosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
  ledThreePosition = (ledThreePosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
  // delay(loopDelay);
}

void circle()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  delta = 1;
  for (const auto &spk : spokes)
  {
    // Set pixel colors, first, set all to black
    for (int i = 0; i < LEDS_PER_SPOKE; i++)
    {
      spk[i] = CRGB::Black;
    }
    // Then set the colors in the appropriate spots
    spk[ledOnePosition] = currentColor;
    spk[ledTwoPosition] = currentColor;
    spk[ledThreePosition] = currentColor;
  }
  // Finally show the pixels
  FastLED.show();

  ledOnePosition = (ledOnePosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
  ledTwoPosition = (ledTwoPosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
  ledThreePosition = (ledThreePosition + delta + LEDS_PER_SPOKE) % LEDS_PER_SPOKE;
  // delay(loopDelay);
}

void circle_backwards()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  delta = -1;
  for (const auto &spk : spokes)
  {
    // Set pixel colors, first, set all to black
    for (int i = 0; i < LEDS_PER_SPOKE; i++)
    {
      spk[i] = CRGB::Black;
    }
    // Then set the colors in the appropriate spots
    spk[ledOnePosition] = currentColor;
    spk[ledTwoPosition] = currentColor;
    spk[ledThreePosition] = currentColor;
  }
  // Finally show the pixels
  FastLED.show();

  ledOnePosition = (ledOnePosition + delta + NUM_LEDS) % NUM_LEDS;
  ledTwoPosition = (ledTwoPosition + delta + NUM_LEDS) % NUM_LEDS;
  ledThreePosition = (ledThreePosition + delta + NUM_LEDS) % NUM_LEDS;
  delay(loopDelay);
}

void flash()
{
  if (!repeat && doneTheNonRepeatingAnimationOnce == true)
  {
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int i = 0; i < NUM_LEDS; i++)
  {
    realleds[i] = currentColor;
    realleds[i].maximizeBrightness();
  }
  FastLED.show();
  delay(15);
  for (int i = 0; i < NUM_LEDS; i++)
  {
    realleds[i].nscale8(192);
  }
  FastLED.show();
  delay(1000);
  for (int f = 0; f < 30; f++)
  {
    for (int i = 0; i < NUM_LEDS; i++)
    {
      realleds[i].nscale8(224);
    }
    FastLED.show();
    delay(33);
  }
}

void spin_1()
{
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  edgesCenterPosition += 1;
  switch (edgesCenterPosition)
  {
  // 0, 2, 4, 1, 3, 5
  case 1:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    break;
  case 2:
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    break;
  case 3:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    break;
  case 4:
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    break;
  case 5:
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    break;
  case 6:
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  default:
    fill_solid(spokes[5], LEDS_PER_SPOKE, CRGB::Red);
    edgesCenterPosition = 0;
    break;
  }
  FastLED.show();
  delay(loopDelay);
}

void spin_1_backwards()
{
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  edgesCenterPosition += 1;
  switch (edgesCenterPosition)
  {
  // 0, 2, 4, 1, 3, 5
  case 1:
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    break;
  case 2:
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    break;
  case 3:
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    break;
  case 4:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    break;
  case 5:
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    break;
  case 6:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  default:
    fill_solid(spokes[5], LEDS_PER_SPOKE, CRGB::Red);
    edgesCenterPosition = 0;
    break;
  }
  FastLED.show();
  delay(loopDelay);
}

void spin_2()
{
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  edgesCenterPosition += 1;
  switch (edgesCenterPosition)
  {
  case 1:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    break;
  case 2:
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    break;
  case 3:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  default:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  }
  FastLED.show();
  delay(loopDelay);
}

void spin_2_backwards()
{
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  edgesCenterPosition += 1;
  switch (edgesCenterPosition)
  {
  // 0-1, 2-3, 4-5
  case 1:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    break;
  case 2:
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    break;
  case 3:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  default:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  }
  FastLED.show();
  delay(loopDelay);
}

void hemi_spin()
{
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  edgesCenterPosition += 1;
  switch (edgesCenterPosition)
  {
  // 0, 2, 4, 1, 3, 5
  case 1:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    break;
  case 2:
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    break;
  case 3:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    break;
  case 4:
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    break;
  case 5:
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    break;
  case 6:
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  default:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  }
  FastLED.show();
  delay(loopDelay);
}

void hemi_spin_backwards()
{
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  edgesCenterPosition += 1;
  switch (edgesCenterPosition)
  {
  case 1:
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    break;
  case 2:
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    break;
  case 3:
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[5], LEDS_PER_SPOKE, currentColor);
    break;
  case 4:
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[3], LEDS_PER_SPOKE, currentColor);
    break;
  case 5:
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[1], LEDS_PER_SPOKE, currentColor);
    break;
  case 6:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  default:
    fill_solid(spokes[0], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[2], LEDS_PER_SPOKE, currentColor);
    fill_solid(spokes[4], LEDS_PER_SPOKE, currentColor);
    edgesCenterPosition = 0;
    break;
  }
  FastLED.show();
  delay(loopDelay);
}

void setupColorPalette(CRGB fillColor)
{
  // 'black out' all 16 palette entries...
  fill_solid(currentPalette, 16, fillColor);
  // and set every fourth one to currentColor.
  currentPalette[0] = currentColor;
  currentPalette[4] = currentColor;
  currentPalette[8] = currentColor;
  currentPalette[12] = currentColor;
}

void animatePalette()
{
  static uint8_t startIndex = 0;
  uint8_t stepSize = 2;
  if (loopDelay < 10)
  {
    stepSize = 4;
  }
  else if (loopDelay < 100)
  {
    stepSize = 3;
  }
  else if (loopDelay < 1000)
  {
    stepSize = 2;
  }
  else if (loopDelay < 2000)
  {
    stepSize = 1;
  }
  startIndex = startIndex + stepSize; /* motion speed */

  FillLEDsFromPaletteColors(startIndex);
  FastLED.show();
  // delay(loopDelay);
}

void off()
{
  saveCurrentAnimation("solid_color");
  current_color = "black";
  reset();
}

void reset()
{
  loopDelay = origLoopDelay;
  holdTime = origHoldTime;
  ledOnePosition = 0;
  ledTwoPosition = 1;
  ledThreePosition = 2;
  delta = 1;
  slinkyPosition = 1;
  edgesCenterPosition = 0;
  spokeMidPoint = (int16_t)std::round((float)LEDS_PER_SPOKE / 2);
}

void saveCurrentAnimation(char *theFunction)
{
  if (strcmp(theFunction, "solid_color") == 0)
  {
    currentAnimation = solid_color;
    // log("currentAnimate = solid_color");
  }
  else if (strcmp(theFunction, "center_out") == 0)
  {
    currentAnimation = center_out;
    // log("currentAnimate = center_out");
  }
  else if (strcmp(theFunction, "edges_in") == 0)
  {
    currentAnimation = edges_in;
    // log("currentAnimate = edges_in");
  }
  else if (strcmp(theFunction, "slinky") == 0)
  {
    currentAnimation = slinky;
    // log("currentAnimate = slinky");
  }
  else if (strcmp(theFunction, "slinky_backwards") == 0)
  {
    currentAnimation = slinky_backwards;
    // log("currentAnimate = slinky_backwards");
  }
  else if (strcmp(theFunction, "bounce") == 0)
  {
    currentAnimation = bounce;
    // log("currentAnimate = bounce");
  }
  else if (strcmp(theFunction, "circle") == 0)
  {
    currentAnimation = circle;
    // log("currentAnimate = circle");
  }
  else if (strcmp(theFunction, "circle_backwards") == 0)
  {
    currentAnimation = circle_backwards;
    // log("currentAnimate = circle_backwards");
  }
  else if (strcmp(theFunction, "flash") == 0)
  {
    currentAnimation = flash;
    // log("currentAnimate = flash");
  }
  else if (strcmp(theFunction, "rainbow") == 0)
  {
    currentAnimation = animatePalette;
    currentPalette = RainbowColors_p;
    currentBlending = LINEARBLEND;
    // log("currentAnimate = rainbow");
  }
  else if (strcmp(theFunction, "rainbow_stripes") == 0)
  {
    currentAnimation = animatePalette;
    currentPalette = RainbowStripeColors_p;
    currentBlending = NOBLEND;
    // log("currentAnimate = rainbow_stripes");
  }
  else if (strcmp(theFunction, "ocean") == 0)
  {
    currentAnimation = animatePalette;
    currentPalette = OceanColors_p;
    currentBlending = NOBLEND;
    // log("currentAnimate = ocean");
  }
  else if (strcmp(theFunction, "stripes") == 0)
  {
    setupColorPalette(CRGB::Black);
    currentAnimation = animatePalette;
    currentBlending = NOBLEND;
    // log("currentAnimate = stripes");
  }
  else if (strcmp(theFunction, "stripes_white") == 0)
  {
    setupColorPalette(CRGB::White);
    currentAnimation = animatePalette;
    currentBlending = NOBLEND;
    // log("currentAnimate = stripes_white");
  }
  else if (strcmp(theFunction, "spin_1") == 0)
  {
    edgesCenterPosition = 0;
    currentAnimation = spin_1;
    currentBlending = NOBLEND;
  }
  else if (strcmp(theFunction, "spin_1_backwards") == 0)
  {
    edgesCenterPosition = 0;
    currentAnimation = spin_1_backwards;
    currentBlending = NOBLEND;
  }
  else if (strcmp(theFunction, "spin_2") == 0)
  {
    edgesCenterPosition = 0;
    currentAnimation = spin_2;
    currentBlending = NOBLEND;
  }
  else if (strcmp(theFunction, "spin_2_backwards") == 0)
  {
    edgesCenterPosition = 0;
    currentAnimation = spin_2_backwards;
    currentBlending = NOBLEND;
  }
  else if (strcmp(theFunction, "hemi_spin") == 0)
  {
    edgesCenterPosition = 0;
    currentAnimation = hemi_spin;
    currentBlending = NOBLEND;
  }
  else if (strcmp(theFunction, "hemi_spin_backwards") == 0)
  {
    edgesCenterPosition = 0;
    currentAnimation = hemi_spin_backwards;
    currentBlending = NOBLEND;
  }
  else
  {
    // log("no matching function name found");
  }
}

void handleMqttMessage(char *topic, byte *payload, unsigned int length)
{
  char message[MAX_MESSAGE_LENGTH + 1];
  if (length > MAX_MESSAGE_LENGTH)
  {
    length = MAX_MESSAGE_LENGTH;
  }
  // convert the type *payload to a string
  strncpy(message, (char *)payload, length);
  message[length] = '\0';
  log("message: ", false);
  log(message);
  if (strcmp(message, (char *)"off") == 0)
  {
    off();
    return;
  }
  if (strcmp(message, (char *)"reset") == 0)
  {
    reset();
    return;
  }
  if (length < 9 || !strstr(message, delim))
  {
    // shortest color = red, shortest anim func = bounce = 9
    // and messages are in the form color:func_name
    // so bail out if either of these conditions fails
    log("invalid animation command, bailing out");
    return;
  }
  // split it into a color:animation pair
  std::vector<std::string> results;
  results = split(message, delim);
  int res_size = results.size();
  if (res_size < 1)
    return;

  reset();

  // results[0] should be a color name or "reset"
  char *theColor = const_cast<char *>(results[0].c_str());
  to_lowercase(theColor);
  // log("theColor: ", false);
  // log(theColor);
  if (strstr(valid_colors, theColor))
  {
    current_color = theColor;
  }

  if (res_size >= 2)
  {
    // results[1] should be a function name
    char *theFunction = const_cast<char *>(results[1].c_str());
    if (strstr(valid_functions, theFunction))
    {
      saveCurrentAnimation(theFunction);
    }

    if (res_size >= 3)
    {
      // if there's a third param, it will be the loopDelay
      char *tmpLoopDelayChar = const_cast<char *>(results[2].c_str());
      uint16_t tmpLoopDelay = atoi(tmpLoopDelayChar);
      if (tmpLoopDelay > 0)
      {
        loopDelay = tmpLoopDelay;
      }
    }
    if (res_size >= 4)
    {
      // if there's a fourth param, it will be the holdTime
      char *tmpHoldTimeChar = const_cast<char *>(results[3].c_str());
      uint16_t tmpHoldTime = atoi(tmpHoldTimeChar);
      if (tmpHoldTime > 0)
      {
        holdTime = tmpHoldTime;
      }
    }
    if (res_size >= 5)
    {
      // if there's a fifth param, it will be the repeat boolean
      char *tmpRepeat = const_cast<char *>(results[4].c_str());
      if (strcmp(tmpRepeat, "false") == 0)
      {
        repeat = false;
        doneTheNonRepeatingAnimationOnce = false;
      }
      else
      {
        repeat = true;
        doneTheNonRepeatingAnimationOnce = false;
      }
    }
  }
}

void mqttReconnect()
{
  // Loop until we're reconnected
  while (!mqttClient.connected())
  {
    log("Attempting MQTT connection...");
    // Attempt to connect
    if (mqttClient.connect(hostname))
    {
      log("connected");
      for (String topic : topics)
      {
        log("Subscribing to:", false);
        log(topic);
        mqttClient.subscribe(topic.c_str());
      }
    }
    else
    {
      // log("failed");
      delay(1000);
    }
  }
}

void connectToNetwork(ESP8266WiFiMulti wifiMulti, char *hostname, NetworkData networks[], int num_elems = 0)
{
  if (num_elems == 0)
  {
    return;
  }
  for (int i = 0; i < num_elems; i++)
  {
    wifiMulti.addAP(networks[i].ssid, networks[i].password);
  }
  log("Connecting ", false);
  while (wifiMulti.run() != WL_CONNECTED)
  {
    delay(1000);
    log('.');
  }
  log('\n');
  log("Network:\t" + WiFi.SSID());
  log("IP address:\t" + WiFi.localIP().toString());

  if (!MDNS.begin(hostname))
  { // Start the mDNS responder for esp8266.local
    log("Error setting up MDNS responder!");
  }
  // log("mDNS responder started");
}

void monitorWiFi(ESP8266WiFiMulti wifiMulti)
{
  if (wifiMulti.run() != WL_CONNECTED)
  {
    if (connectioWasAlive == true)
    {
      connectioWasAlive = false;
      log("Looking for WiFi ");
    }
    log(".", false);
    delay(500);
    MDNS.notifyAPChange();
  }
  else if (connectioWasAlive == false)
  {
    connectioWasAlive = true;
    // log(" connected to " + WiFi.SSID());
  }
  // Calling update() is key to getting the ESP8266 to respond to hostname.local
  MDNS.update();
}

void setup()
{
  delay(3000); // Startup delay
  Serial.begin(115200);
  pinMode(DATA_PIN, OUTPUT);
  //  pinMode(CLOCK_PIN, OUTPUT);
  // limit power draw and voltage
  //  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  //  FastLED.addLeds<LED_TYPE, DATA_PIN, CLOCK_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.showColor(CRGB::Black);
  currentAnimation = solid_color;
  enableLogging();
  NetworkData net1, net2;
  net1.ssid = ssid;
  net1.password = password;
  NetworkData networks[] = {net1};
  enableLogging();
  connectToNetwork(wifiMulti, hostname, networks, 1);
  mqttClient.setServer(brokerHostname, 1883);
  mqttClient.setCallback(handleMqttMessage);
}

void loop()
{
  monitorWiFi(wifiMulti);
  if (!mqttClient.connected())
  {
    mqttReconnect();
  }
  mqttClient.loop(); // this is ESSENTIAL!
  set_color(current_color);
  currentAnimation();
}
