/*
   ESP8266 code to control multi-channel relays for a display
   that creates the scene from the Grinch where bags are shoved
   up & out the chimbly while Max is on the ground waiting to
   catch them.

    - Configuration is done in config.h
  License: MIT


****** NOTE: MOTOR IS NOT WORKING IN THIS SKETCH WILL BE
****** IMPLEMENTED SEPARATELY

Test with:
mosquitto_pub -h BROKER_ADDR -i publisher -t NODE_NAME -m 'on'

*/

// XXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION CAN BE DONE IN THE config.h FILE
// XXXXXXXXXXXXXXXXXXXX

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

//int switch_state = 0;
//int prev_switch_state = 0;

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
std::function<void(void)> currentAnimation;
char *current_function = "turn_off";

void turn_off() {
  log("turning off...");
  saveCurrentAnimation("turn_off");
  digitalWrite(relay1GpioPin, LOW);
  digitalWrite(relay2GpioPin, LOW);
  digitalWrite(relay3GpioPin, LOW);
  digitalWrite(relay4GpioPin, LOW);
//  analogWrite(motorControllerIn1, 0);
//  analogWrite(motorControllerIn2, 0);
}
void turn_on() {
  log("turning on...");
  saveCurrentAnimation("turn_on");
  digitalWrite(relay1GpioPin, HIGH);
  digitalWrite(relay2GpioPin, HIGH);
  digitalWrite(relay3GpioPin, HIGH);
  digitalWrite(relay4GpioPin, HIGH);
  // loop() calls maybeChangeMotorDirection() which will drive the motor
}

//void maybeChangeMotorDirection() {
//  if (current_function == "turn_off") {
//    // turn off motor and return
//    analogWrite(motorControllerIn1, 0);
//    analogWrite(motorControllerIn2, 0);
//    return;
//  }
//  // read the switch and decide if we need to reverse direction
//  switch_state = digitalRead(toggleGpioPin);
//  if (switch_state == 1) {
//    log(">>>>>>>>>>>>> switch is on");
//  } else {
//    log("switch is off");
//  }
//  if (prev_switch_state == 1) {
//    log("prev_switch_state is on");
//  } else {
//    log("prev_switch_state is off");
//  }
//  if (switch_state != prev_switch_state) {
//    if (switch_state == 1) {
//      // forward
//      log("going forward");
//      analogWrite(motorControllerIn1, motor_speed);
//      analogWrite(motorControllerIn2, 0);
//    } else {
//      // reverse
//      log("going in reverse");
//      analogWrite(motorControllerIn1, 0);
//      analogWrite(motorControllerIn2, motor_speed);
//    }
//  }
//  prev_switch_state = switch_state;
//}

void animate() {
  static uint8_t startIndex = 0;
  /*
  Max catching bags animation:
    - Relay 1 controls chimney and spotlight on Max; it is always on
    - Relay 2 controls the highest set of bags
    - Relay 3 controls the middle set of bags
    - Relay 4 controls the lowest set of bags

    Relays 2, 3, and 4 are on sequentially, otherwise off
    loop() calls maybeChangeMotorDirection() which will drive the motor
  */
  log("animating...", false);
  digitalWrite(relay1GpioPin, HIGH);
  if (startIndex == 0) {
    // sequence start, turn on highest set of bags
    log("highest");
    digitalWrite(relay2GpioPin, HIGH);
    digitalWrite(relay3GpioPin, LOW);
    digitalWrite(relay4GpioPin, LOW);
    startIndex = 1;
  } else if (startIndex == 1) {
    // turn on middle set of bags
    log("middle");
    digitalWrite(relay2GpioPin, LOW);
    digitalWrite(relay3GpioPin, HIGH);
    digitalWrite(relay4GpioPin, LOW);
    startIndex = 2;
  } else {
    // turn on lowest set of bags (right above Max)
    log("lowest");
    digitalWrite(relay2GpioPin, LOW);
    digitalWrite(relay3GpioPin, LOW);
    digitalWrite(relay4GpioPin, HIGH);
    startIndex = 0;
  }
}

void saveCurrentAnimation(char *theFunction) {
  current_function = theFunction;
  if (strcmp(theFunction, "turn_off") == 0) {
    currentAnimation = turn_off;
  } else if (strcmp(theFunction, "animate") == 0) {
    currentAnimation = animate;
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
  if (strcmp(message, (char *)"off") == 0 || strcmp(message, (char *)"turn_off") == 0) {
    saveCurrentAnimation("turn_off");
    return;
  }
  if (strcmp(message, (char *)"on") == 0 || strcmp(message, (char *)"turn_on") == 0 || strcmp(message, (char *)"animate") == 0) {
    saveCurrentAnimation("animate");
    return;
  }
  if (strcmp(message, (char *)"debug") == 0) {
    saveCurrentAnimation("debug");
    return;
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
  ArduinoOTA.onEnd([]() {
    log("End OTA update");
  });
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
  pinMode(relay1GpioPin, OUTPUT);
  pinMode(relay2GpioPin, OUTPUT);
  pinMode(relay3GpioPin, OUTPUT);
  pinMode(relay4GpioPin, OUTPUT);
//  pinMode(motorControllerIn1, OUTPUT);
//  pinMode(motorControllerIn2, OUTPUT);
//  pinMode(toggleGpioPin, INPUT_PULLUP);

  saveCurrentAnimation("turn_off");
  currentAnimation = turn_off;
  turn_off();
//  analogWrite(motorControllerIn1, 0);
//  analogWrite(motorControllerIn2, 0);
  enableLogging();
  connectToNetwork();
}

void loop() {
  EVERY_N_SECONDS(1) {
    monitorWiFi();
  }
  mqttClient.loop();    // this is ESSENTIAL for MQTT messages to be received!
  ArduinoOTA.handle();  // check for & handle OTA update requests

//  EVERY_N_MILLISECONDS(100) {
//    // will read toggle switch state and change motor direction
//    // if the switch has been flipped since the last run
//    maybeChangeMotorDirection();
//  }

  EVERY_N_MILLISECONDS(loopDelay) {
    currentAnimation();
  }
}
