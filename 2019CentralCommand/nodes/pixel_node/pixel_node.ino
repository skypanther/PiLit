/*
   ESP8266 code to control RGB pixel strips
    - Network connection code
    - MQTT subscriber code
    - FastLED based pixel control code
*/

#include <string>
#include <unordered_map>

#include <FastLED.h>
#include <ESP8266mDNS.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <WiFiServerSecure.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>
#include "utils.h"
#define FASTLED_ESP8266_NODEMCU_PIN_ORDER
#define MAX_MESSAGE_LENGTH 128

// CHANGE THESE TO MATCH THE PIXEL TYPE AND SPECIFICS OF YOUR SETUP
#define LED_TYPE APA102
#define DATA_PIN 5
#define CLOCK_PIN 4
#define NUM_LEDS 100
#define COLOR_ORDER BGR
#define BRIGHTNESS 50

// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname = "arch1";                   // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "arches",
  "arch1"
};
char *brokerHostname = "Tim-Poulsen-MBP15.local";  // "192.168.1.6";       // Hostname/IP address of the MQTT broker
char *net1_ssid = "poulsen";
char *net1_password = "PASSWORD";
char *net2_ssid = "poulsen2";
char *net2_password = "PASSWORD";

// Some base delay times
uint16_t loopDelay = 10;     // Time (ms) between calls to animation function
uint16_t holdTime = 50;      // Time (ms) delay at the end of some back-n-forth functions (e.g. bounce)


// XXXXXXXXXX  DON'T CHANGE ANYTHING BELOW THIS IN THIS FILE  XXXXXXXXXX

CRGB leds[NUM_LEDS];
struct NetworkData {
  char *ssid;
  char *password;
};

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;

char valid_colors[] = "white snow silver gray grey darkgray darkgrey black red crimson darkmagenta darkred magenta maroon orange orangered darkorange yellow gold green lime darkgreen forestgreen cyan darkcyan blue deepskyblue royalblue skyblue darkblue navy blueviolet purple violet indigo darkviolet";
char valid_functions[] = "solid_color center_out edges_in slinky slinky_backwards bounce";
char delim[] = ":";
char *current_color = "black";
std::function<void(void)> currentAnimation;
int16_t positionRed = 0;   // Set initial start position of Red pixel
int16_t positionWhite = 1; // Set initial start position of White pixel
int16_t positionBlue = 2;  // Set initial start position of Blue pixel
int8_t delta = 1;          // Using a negative value will move pixels backwards.

int16_t slinkyPosition = 1;
int16_t edgesCenterPosition = 0;

CRGB currentColor = CRGB::Black;
char *current_function = "solid_color";
uint16_t origLoopDelay = 10;
uint16_t origHoldTime = 50;

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
  } else {
    // log("no matching function name found");    
  }
}

//
// Helper functions
//

void set_color(char *colorName) {
  if (colorTable.count(colorName) > 0) {
    // Serial.print("Setting color to ");
    // Serial.println(colorName);
    currentColor = colorTable[colorName];
  }
}


//
// LED pattern functions
//
void solid_color() {
  // log("solid_color()");
  FastLED.showColor(currentColor);
}

void center_out() {
  // log("center_out()");
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i <= NUM_LEDS/2+edgesCenterPosition && i >= NUM_LEDS/2-edgesCenterPosition) {
      leds[i] = currentColor;
    } else {
      leds[i] = CRGB::Black;
    }
  }
  FastLED.show();

  edgesCenterPosition = edgesCenterPosition + delta;
  
  if (edgesCenterPosition > NUM_LEDS/2+1) {
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

void edges_in() {
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i <= edgesCenterPosition || i>=NUM_LEDS-(edgesCenterPosition+1)) {
      leds[i] = currentColor;
    } else {
      leds[i] = CRGB::Black;
    }
  }
  FastLED.show();

  edgesCenterPosition = edgesCenterPosition + delta;
  
  if (edgesCenterPosition > NUM_LEDS/2+1) {
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


void slinky_backwards() {
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

void slinky() {
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

void bounce() {
  // Set pixel color
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
  if (positionBlue == NUM_LEDS - 1) {
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

void off() {
  saveCurrentAnimation("solid_color");
  current_color = "black";
  loopDelay = origLoopDelay;
  holdTime = origHoldTime;
}

void reset() {
  loopDelay = origLoopDelay;
  holdTime = origHoldTime;
}

void handleMqttMessage(char *topic, byte *payload, unsigned int length) {
  char message[MAX_MESSAGE_LENGTH + 1];
  if (length > MAX_MESSAGE_LENGTH) {
    length = MAX_MESSAGE_LENGTH;
  }
  // convert the type *payload to a string
  strncpy(message, (char *)payload, length);
  message[length] = '\0';
  log("message: ", false);log(message);
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
  if (results.size() < 1) return;

  // results[0] should be a color name or "reset"
  char *theColor = const_cast<char*>(results[0].c_str());
  to_lowercase(theColor);
  // log("theColor: ", false);
  // log(theColor);  
  if (strstr(valid_colors, theColor)) {
    current_color = theColor;
  }

  if (results.size() >= 2) {
    // results[1] should be a function name
    char *theFunction = const_cast<char*>(results[1].c_str());
    // log("theFunction: ", false);log(theFunction);
    if (strstr(valid_functions, theFunction)) {
      saveCurrentAnimation(theFunction);
    }

    if (results.size() >= 3) {
      // if there's a third param, it will be the loopDelay
      char *tmpLoopDelayChar = const_cast<char*>(results[2].c_str());
      uint16_t tmpLoopDelay = atoi(tmpLoopDelayChar);
      if (tmpLoopDelay > 0) {
        loopDelay = tmpLoopDelay;
      }
    }
    if (results.size() == 4) {
      // if there's a fourth param, it will be the holdTime
      char *tmpHoldTimeChar = const_cast<char*>(results[3].c_str());
      uint16_t tmpHoldTime = atoi(tmpHoldTimeChar);
      if (tmpHoldTime > 0) {
        holdTime = tmpHoldTime;
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

void connectToNetwork(ESP8266WiFiMulti wifiMulti, char *hostname, NetworkData networks[], int num_elems = 0) {
  if (num_elems == 0) {
    return;
  }
  for (int i = 0; i < num_elems; i++) {
    wifiMulti.addAP(networks[i].ssid, networks[i].password);
  }
  log("Connecting ", false);
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(1000);
    log('.');
  }
  log('\n');
  log("Network:\t" + WiFi.SSID());
  log("IP address:\t" + WiFi.localIP().toString());

  if (!MDNS.begin(hostname)) { // Start the mDNS responder for esp8266.local
    log("Error setting up MDNS responder!");
  }
  // log("mDNS responder started");
}

void monitorWiFi(ESP8266WiFiMulti wifiMulti) {
  if (wifiMulti.run() != WL_CONNECTED) {
    if (connectioWasAlive == true) {
      connectioWasAlive = false;
      // log("Looking for WiFi ");
    }
    // log(".", false);
    delay(500);
    MDNS.notifyAPChange();
  } else if (connectioWasAlive == false) {
    connectioWasAlive = true;
    // log(" connected to " + WiFi.SSID());
  }
  // Calling update() is key to getting the ESP8266 to respond to hostname.local
  MDNS.update();
}

void setup() {
  Serial.begin(115200);
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  delay(3000); // Startup delay
  FastLED.addLeds<LED_TYPE, DATA_PIN, CLOCK_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.showColor(CRGB::Black);
  currentAnimation = solid_color;
  NetworkData net1, net2;
  net1.ssid = net1_ssid;
  net1.password = net1_password;
  net2.ssid = net2_ssid;
  net2.password = net2_password;
  NetworkData networks[] = {net1, net2};
  enableLogging();
  connectToNetwork(wifiMulti, hostname, networks, 2);
  mqttClient.setServer(brokerHostname, 1883);
  mqttClient.setCallback(handleMqttMessage);
}

void loop() {
  monitorWiFi(wifiMulti);
  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  mqttClient.loop();  // this is ESSENTIAL!
  set_color(current_color);
  currentAnimation();
  delay(loopDelay);
}
