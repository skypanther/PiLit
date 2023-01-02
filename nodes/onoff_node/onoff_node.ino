/*
   ESP8266 code to control one-channel relays (on/off switches)
    - Network connection code
    - MQTT subscriber code

  ************************************************
  ALL CONFIGURATION IS DONE IN THE CONFIG.H FILE
  ************************************************

*/

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

#include "config.h"
#include "utils.h"

#define MAX_MESSAGE_LENGTH 128

std::function<void(void)> currentAnimation;
char *current_function = "turn_off";

bool switchIsCurrentlyOn = false;

void turn_off() {
  log("turning off...");
  digitalWrite(relayGpioPin, LOW);
  switchIsCurrentlyOn = false;
}
void turn_on() {
  log("turning on...");
  digitalWrite(relayGpioPin, HIGH);
  switchIsCurrentlyOn = true;
}
void toggle() {
  if (switchIsCurrentlyOn) {
    log("turning off...");
    digitalWrite(relayGpioPin, LOW);
    switchIsCurrentlyOn = false;
  } else {
    log("turning on...");
    digitalWrite(relayGpioPin, HIGH);
    switchIsCurrentlyOn = true;
  }
}

void saveCurrentAnimation(char *theFunction) {
  current_function = theFunction;
  if (strcmp(theFunction, "turn_off") == 0) {
    currentAnimation = turn_off;
  } else if (strcmp(theFunction, "turn_on") == 0) {
    currentAnimation = turn_on;
  } else if (strcmp(theFunction, "toggle") == 0) {
    currentAnimation = toggle;
  } else if (strcmp(theFunction, "debug") == 0) {
    currentAnimation = turn_on;
  } else {
    currentAnimation = turn_off;
  }
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
  if (strcmp(message, (char *)"off") == 0 ||
      strcmp(message, (char *)"turn_off") == 0) {
    saveCurrentAnimation("turn_off");
    return;
  }
  if (strcmp(message, (char *)"on") == 0 ||
      strcmp(message, (char *)"turn_on") == 0) {
    saveCurrentAnimation("turn_on");
    return;
  }
  if (strcmp(message, (char *)"toggle") == 0) {
    saveCurrentAnimation("toggle");
    return;
  }
  if (strcmp(message, (char *)"debug") == 0) {
    saveCurrentAnimation("debug");
    return;
  }
}

void setup() {
  Serial.begin(115200);
  enableLogging();
  pinMode(relayGpioPin, OUTPUT);
  saveCurrentAnimation("turn_off");
  turn_off();
  connectToNetwork(handleMqttMessage);
}

void loop() {
  EVERY_N_SECONDS(1) { monitorWiFi(); }
  mqttClient.loop();    // this is ESSENTIAL for MQTT messages to be received!
  ArduinoOTA.handle();  // check for & handle OTA update requests

  EVERY_N_MILLISECONDS(loopDelay) { currentAnimation(); }
}