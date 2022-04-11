/*
  @author Tim Poulsen, skypanther
  ESP8266 code to control RGB pixel strips
    - Network connection code
    - MQTT subscriber code
    - FastLED based pixel control code
  License: MIT
*/

// XXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION CAN BE DONE IN THE config.h FILE
// XXXXXXXXXXXXXXXXXXXX

// EXCEPT YOU MIGHT NEED TO SWAP WHICH OF THESE IS COMMENTED OUT
#define FASTLED_ESP8266_RAW_PIN_ORDER
//#define FASTLED_ESP8266_NODEMCU_PIN_ORDER


#include <ArduinoOTA.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <FastLED.h>
#include <NTPClient.h>
#include <PubSubClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <WiFiServerSecure.h>
#include <WiFiUdp.h>
#include <string>
#include <unordered_map>
#include "config.h"
#include "utils.h"

#define MAX_MESSAGE_LENGTH 128
CRGB leds[NUM_LEDS];

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;
int utcOffsetInSeconds = utcOffsetInHours * 60 * 60;

// Create an NTP client so we can get the current time
WiFiUDP ntpUDP;
// Ping NTP server no more than every 5 minutes
#define NTP_UPDATE_THROTTLE_MILLLISECONDS (5UL * 60UL * 60UL * 1000UL)
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds,
                     NTP_UPDATE_THROTTLE_MILLLISECONDS);

char valid_colors[] =
    "white snow silver gray grey darkgray darkgrey black red crimson "
    "darkmagenta darkred magenta maroon orange orangered darkorange yellow "
    "gold green lime darkgreen forestgreen cyan darkcyan blue deepskyblue "
    "royalblue skyblue darkblue navy blueviolet purple violet indigo "
    "darkviolet";
char valid_functions[] =
    "solid_color center_out edges_in slinky slinky_backwards bounce "
    "bounce_backwards circle circle_backwards flash rainbow rainbow_stripes "
    "stripes stripes_white ocean";
char delim[] = ":";
char *current_color = "black";
std::function<void(void)> currentAnimation;
int16_t positionRed = 0;    // Set initial start position of Red pixel
int16_t positionWhite = 1;  // Set initial start position of White pixel
int16_t positionBlue = 2;   // Set initial start position of Blue pixel
int8_t delta = 1;  // Using a negative value will move pixels backwards.

int16_t slinkyPosition = 1;
int16_t edgesCenterPosition = 0;

CRGB currentColor = CRGB::Black;
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

void saveCurrentAnimation(char *theFunction) {
  if (strcmp(theFunction, "solid_color") == 0) {
    currentAnimation = solid_color;
    // log("currentAnimate = solid_color");
  } else if (strcmp(theFunction, "center_out") == 0) {
    currentAnimation = center_out;
    // log("currentAnimate = center_out");
  } else if (strcmp(theFunction, "edges_in") == 0) {
    currentAnimation = edges_in;
    // log("currentAnimate = edges_in");
  } else if (strcmp(theFunction, "slinky") == 0) {
    currentAnimation = slinky;
    // log("currentAnimate = slinky");
  } else if (strcmp(theFunction, "slinky_backwards") == 0) {
    currentAnimation = slinky_backwards;
    // log("currentAnimate = slinky_backwards");
  } else if (strcmp(theFunction, "bounce") == 0) {
    currentAnimation = bounce;
    // log("currentAnimate = bounce");
  } else if (strcmp(theFunction, "bounce_backwards") == 0) {
    currentAnimation = bounce_backwards;
    // log("currentAnimate = bounce_backwards");
  } else if (strcmp(theFunction, "circle") == 0) {
    currentAnimation = circle;
    // log("currentAnimate = circle");
  } else if (strcmp(theFunction, "circle_backwards") == 0) {
    currentAnimation = circle_backwards;
    // log("currentAnimate = circle_backwards");
  } else if (strcmp(theFunction, "flash") == 0) {
    currentAnimation = flash;
    // log("currentAnimate = flash");
  } else if (strcmp(theFunction, "rainbow") == 0) {
    currentAnimation = animatePalette;
    currentPalette = RainbowColors_p;
    currentBlending = LINEARBLEND;
    // log("currentAnimate = rainbow");
  } else if (strcmp(theFunction, "rainbow_stripes") == 0) {
    currentAnimation = animatePalette;
    currentPalette = RainbowStripeColors_p;
    currentBlending = NOBLEND;
    // log("currentAnimate = rainbow_stripes");
  } else if (strcmp(theFunction, "ocean") == 0) {
    currentAnimation = animatePalette;
    currentPalette = OceanColors_p;
    currentBlending = NOBLEND;
    // log("currentAnimate = ocean");
  } else if (strcmp(theFunction, "stripes") == 0) {
    setupColorPalette(CRGB::Black);
    currentAnimation = animatePalette;
    currentBlending = NOBLEND;
    // log("currentAnimate = stripes");
  } else if (strcmp(theFunction, "stripes_white") == 0) {
    setupColorPalette(CRGB::White);
    currentAnimation = animatePalette;
    currentBlending = NOBLEND;
    // log("currentAnimate = stripes_white");
  } else {
    // log("no matching function name found");
  }
}

//
// Helper functions
//

void set_color(char *colorName) {
  if (colorTable.count(colorName) > 0) {
    currentColor = colorTable[colorName];
  }
}

void FillLEDsFromPaletteColors(uint8_t colorIndex) {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = ColorFromPalette(currentPalette, colorIndex, BRIGHTNESS,
                               currentBlending);
    colorIndex += 3;
  }
}

//
// LED pattern functions
//
void solid_color() { FastLED.showColor(currentColor); }

void center_out() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    edgesCenterPosition = 0;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < NUM_LEDS; j++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      if (i <= NUM_LEDS / 2 + edgesCenterPosition &&
          i >= NUM_LEDS / 2 - edgesCenterPosition) {
        leds[i] = currentColor;
      } else {
        leds[i] = CRGB::Black;
      }
    }
    FastLED.show();

    edgesCenterPosition = edgesCenterPosition + delta;

    if (edgesCenterPosition > NUM_LEDS / 2 + 1) {
      // log("Reverse ... towards pos 0");
      edgesCenterPosition -= 1;
      delta = -1;
      delay(holdTime);
    } else if (edgesCenterPosition < -1) {
      // log("Forward we go!");
      edgesCenterPosition += 1;
      delta = 1;
      delay(holdTime);
    }
  }
}

void edges_in() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    edgesCenterPosition = 0;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < NUM_LEDS; j++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      if (i <= edgesCenterPosition ||
          i >= NUM_LEDS - (edgesCenterPosition + 1)) {
        leds[i] = currentColor;
      } else {
        leds[i] = CRGB::Black;
      }
    }
    FastLED.show();

    edgesCenterPosition = edgesCenterPosition + delta;

    if (edgesCenterPosition > NUM_LEDS / 2 + 1) {
      // log("Reverse ... towards pos 0");
      edgesCenterPosition -= 1;
      delta = -1;
      delay(holdTime);
    } else if (edgesCenterPosition < -1) {
      // log("Forward we go!");
      edgesCenterPosition += 1;
      delta = 1;
      delay(holdTime);
    }
  }
}

void slinky_backwards() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    slinkyPosition = NUM_LEDS;
    delta = -1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < NUM_LEDS; j++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      if (i > slinkyPosition) {
        leds[i] = currentColor;
      } else {
        leds[i] = CRGB::Black;
      }
    }
    FastLED.show();

    if (slinkyPosition == NUM_LEDS - 1) {
      // log("Reverse ... towards pos 0");
      delta = -1;
      delay(holdTime);
    } else if (slinkyPosition == 0) {
      // log("Forward we go!");
      delta = 1;
      delay(holdTime);
    }
    slinkyPosition = (slinkyPosition + delta + NUM_LEDS) % NUM_LEDS;
  }
}

void slinky() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    slinkyPosition = 1;
    delta = 1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int j = 0; j < NUM_LEDS; j++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      if (i <= slinkyPosition) {
        leds[i] = currentColor;
      } else {
        leds[i] = CRGB::Black;
      }
    }
    FastLED.show();

    if (slinkyPosition == NUM_LEDS - 1) {
      // log("Reverse ... towards pos 0");
      delta = -1;
      delay(holdTime);
    } else if (slinkyPosition == 0) {
      // log("Forward we go!");
      delta = 1;
      delay(holdTime);
    }
    slinkyPosition = (slinkyPosition + delta + NUM_LEDS) % NUM_LEDS;
  }
}

void bounce() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    positionRed = 0;
    positionWhite = 1;
    positionBlue = 2;
    delta = 1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  // Set pixel color
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[positionRed] = currentColor;
    leds[positionWhite] = currentColor;
    leds[positionBlue] = currentColor;

    // Show the pixels
    FastLED.show();

    // Set pixels back to Black for the next loop around.
    leds[positionRed] = CRGB::Black;
    leds[positionWhite] = CRGB::Black;
    leds[positionBlue] = CRGB::Black;

    // Set new position, moving (forward or backward) by delta.
    // NUM_LEDS is added to the position before doing the modulo
    // to cover cases where delta is a negative value.
    if (positionWhite == NUM_LEDS - 1) {
      // log("Reverse ... towards pos 0");
      delta = -1;
    } else if (positionBlue == 1) {
      // log("Forward we go!");
      delta = 1;
    }
    positionRed = (positionRed + delta + NUM_LEDS) % NUM_LEDS;
    positionWhite = (positionWhite + delta + NUM_LEDS) % NUM_LEDS;
    positionBlue = (positionBlue + delta + NUM_LEDS) % NUM_LEDS;
  }
}

void bounce_backwards() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    positionRed = NUM_LEDS - 2;
    positionWhite = NUM_LEDS - 1;
    positionBlue = NUM_LEDS;
    delta = -1;
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  // Set pixel color
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[positionRed] = currentColor;
    leds[positionWhite] = currentColor;
    leds[positionBlue] = currentColor;

    // Show the pixels
    FastLED.show();

    // Set pixels back to Black for the next loop around.
    leds[positionRed] = CRGB::Black;
    leds[positionWhite] = CRGB::Black;
    leds[positionBlue] = CRGB::Black;

    // Set new position, moving (forward or backward) by delta.
    // NUM_LEDS is added to the position before doing the modulo
    // to cover cases where delta is a negative value.
    if (positionWhite == NUM_LEDS - 1) {
      // log("Reverse ... towards pos 0");
      delta = -1;
    } else if (positionBlue == 1) {
      // log("Forward we go!");
      delta = 1;
    }
    positionRed = (positionRed + delta + NUM_LEDS) % NUM_LEDS;
    positionWhite = (positionWhite + delta + NUM_LEDS) % NUM_LEDS;
    positionBlue = (positionBlue + delta + NUM_LEDS) % NUM_LEDS;
  }
}

void circle() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  // Set pixel color
  delta = 1;
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[positionRed] = currentColor;
    leds[positionWhite] = currentColor;
    leds[positionBlue] = currentColor;

    // Show the pixels
    FastLED.show();

    // Set pixels back to Black for the next loop around.
    leds[positionRed] = CRGB::Black;
    leds[positionWhite] = CRGB::Black;
    leds[positionBlue] = CRGB::Black;

    positionRed = (positionRed + delta + NUM_LEDS) % NUM_LEDS;
    positionWhite = (positionWhite + delta + NUM_LEDS) % NUM_LEDS;
    positionBlue = (positionBlue + delta + NUM_LEDS) % NUM_LEDS;
  }
}

void circle_backwards() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  // Set pixel color
  delta = -1;
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[positionRed] = currentColor;
    leds[positionWhite] = currentColor;
    leds[positionBlue] = currentColor;

    // Show the pixels
    FastLED.show();

    // Set pixels back to Black for the next loop around.
    leds[positionRed] = CRGB::Black;
    leds[positionWhite] = CRGB::Black;
    leds[positionBlue] = CRGB::Black;

    positionRed = (positionRed + delta + NUM_LEDS) % NUM_LEDS;
    positionWhite = (positionWhite + delta + NUM_LEDS) % NUM_LEDS;
    positionBlue = (positionBlue + delta + NUM_LEDS) % NUM_LEDS;
  }
}

void flash() {
  if (!repeat && doneTheNonRepeatingAnimationOnce == true) {
    return;
  }
  doneTheNonRepeatingAnimationOnce = true;
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = currentColor;
    leds[i].maximizeBrightness();
  }
  FastLED.show();
  delay(15);
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i].nscale8(192);
  }
  FastLED.show();
  delay(1000);
  for (int f = 0; f < 30; f++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i].nscale8(224);
    }
    FastLED.show();
    delay(33);
  }
}

void setupColorPalette(CRGB fillColor) {
  // 'black out' all 16 palette entries...
  fill_solid(currentPalette, 16, fillColor);
  // and set every fourth one to currentColor.
  currentPalette[0] = currentColor;
  currentPalette[4] = currentColor;
  currentPalette[8] = currentColor;
  currentPalette[12] = currentColor;
}

void animatePalette() {
  static uint8_t startIndex = 0;
  startIndex = startIndex + 1; /* motion speed */

  FillLEDsFromPaletteColors(startIndex);
  FastLED.show();
}

void off() {
  saveCurrentAnimation("solid_color");
  current_color = "black";
  reset();
}

void reset() {
  loopDelay = origLoopDelay;
  holdTime = origHoldTime;
  positionRed = 0;
  positionWhite = 1;
  positionBlue = 2;
  delta = 1;
  slinkyPosition = 1;
  edgesCenterPosition = 0;
}

void handleMqttMessage(char *topic, byte *payload, unsigned int length) {
  char message[MAX_MESSAGE_LENGTH + 1];
  if (length > MAX_MESSAGE_LENGTH) {
    length = MAX_MESSAGE_LENGTH;
  }
  // convert the type *payload to a string
  strncpy(message, (char *)payload, length);
  message[length] = '\0';
  log("message: ", false);
  log(message);
  if (strcmp(message, (char *)"off") == 0) {
    off();
    return;
  }
  if (strcmp(message, (char *)"reset") == 0) {
    reset();
    return;
  }
  if (length < 9 || !strstr(message, delim)) {
    // shortest color = red, shortest anim func = bounce = 9
    // and messages are in the form color:func_name
    // so bail out if either of these conditions fails
    return;
  }
  // split it into a color:animation pair
  std::vector<std::string> results;
  results = split(message, delim);
  int res_size = results.size();
  if (res_size < 1) return;

  // results[0] should be a color name or "reset"
  char *theColor = const_cast<char *>(results[0].c_str());
  to_lowercase(theColor);
  // log("theColor: ", false);
  // log(theColor);
  if (strstr(valid_colors, theColor)) {
    current_color = theColor;
  }

  if (res_size >= 2) {
    // results[1] should be a function name
    char *theFunction = const_cast<char *>(results[1].c_str());
    if (strstr(valid_functions, theFunction)) {
      saveCurrentAnimation(theFunction);
    }

    if (res_size >= 3) {
      // if there's a third param, it will be the loopDelay
      char *tmpLoopDelayChar = const_cast<char *>(results[2].c_str());
      uint16_t tmpLoopDelay = atoi(tmpLoopDelayChar);
      if (tmpLoopDelay > 0) {
        loopDelay = tmpLoopDelay;
      }
    }
    if (res_size >= 4) {
      // if there's a fourth param, it will be the holdTime
      char *tmpHoldTimeChar = const_cast<char *>(results[3].c_str());
      uint16_t tmpHoldTime = atoi(tmpHoldTimeChar);
      if (tmpHoldTime > 0) {
        holdTime = tmpHoldTime;
      }
    }
    if (res_size >= 5) {
      // if there's a fifth param, it will be the repeat boolean
      char *tmpRepeat = const_cast<char *>(results[4].c_str());
      if (strcmp(tmpRepeat, "false") == 0) {
        repeat = false;
        doneTheNonRepeatingAnimationOnce = false;
      } else {
        repeat = true;
        doneTheNonRepeatingAnimationOnce = false;
      }
    }
  }
}

void mqttReconnect() {
  // Loop until we're reconnected
  while (!mqttClient.connected()) {
    log("Attempting MQTT connection...");
    // Attempt to connect
    if (mqttClient.connect(hostname)) {
      log("connected");
      for (String topic : topics) {
        log("Subscribing to:", false);
        log(topic);
        mqttClient.subscribe(topic.c_str());
      }
    } else {
      // log("failed");
      delay(1000);
    }
  }
}

void connectToNetwork() {
  // Network setup
  WiFi.mode(WIFI_STA);
  WiFi.setSleepMode(WIFI_NONE_SLEEP);
  WiFi.begin(ssid, password);
  mqttClient.setServer(brokerHostname, 1883);
  mqttClient.setCallback(handleMqttMessage);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    log('.');
  }
  log('\n');
  log("Network:\t" + WiFi.SSID());
  log("IP address:\t" + WiFi.localIP().toString());

  // Start the mDNS responder for esp8266.local
  if (!MDNS.begin(hostname)) {
    log("Error setting up MDNS responder!");
    return;
  }
  MDNS.setHostname(hostname);
  timeClient.begin();

  // OTA Update Config
  ArduinoOTA.setHostname(hostname);
  ArduinoOTA.setPassword(ota_password);
  ArduinoOTA.onStart([]() {
    String type = "sketch";
    if (ArduinoOTA.getCommand() == U_FS) {
      // command value for updating the sketch U_FLASH
      type = "filesystem";
    }
    // NOTE: if updating FS this would be the place to unmount FS using FS.end()
    log("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() { log("End OTA update"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    log("Progress: " + String(progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    if (error == OTA_AUTH_ERROR) {
      log("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      log("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      log("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      log("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      log("End Failed");
    }
  });
  ArduinoOTA.begin();
}

void monitorWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    if (connectioWasAlive == true) {
      connectioWasAlive = false;
    }
    MDNS.notifyAPChange();
  } else if (connectioWasAlive == false) {
    connectioWasAlive = true;
  }
  MDNS.update();
  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  timeClient.update();
  // TODO -- use the time that was returned, see
  // https://github.com/arduino-libraries/NTPClient/blob/master/NTPClient.h
}

void setup() {
  Serial.begin(115200);
  delay(3000);  // Startup delay
  pinMode(DATA_PIN, OUTPUT);
#if defined(CLOCK_PIN)
  pinMode(CLOCK_PIN, OUTPUT);
#endif
// limit power draw and voltage
// FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
#if defined(CLOCK_PIN)
  FastLED.addLeds<LED_TYPE, DATA_PIN, CLOCK_PIN, COLOR_ORDER>(leds, NUM_LEDS);
#else
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
#endif
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.showColor(CRGB::Black);
  currentAnimation = solid_color;
  enableLogging();
  connectToNetwork();
}

void loop() {
  EVERY_N_SECONDS(1) { monitorWiFi(); }
  mqttClient.loop();    // this is ESSENTIAL for MQTT messages to be received!
  ArduinoOTA.handle();  // check for & handle OTA update requests

  EVERY_N_MILLISECONDS(loopDelay) {
    set_color(current_color);
    currentAnimation();
  }
}
