/*
   ESP8266/ESP32 code to control a "Santa Drop In" sign in which
   a pair of relays is used to turn the words Drop and In on and
   off, alternating.

    - Configuration is done in config.h
  License: MIT


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
char *turn_on_signal = "turn_on";
char *turn_off_signal = "turn_off";
char *animate_signal = "animate";
char *debug_signal = "debug";
bool isAnimating = false;
bool relay2IsOn = false;

struct NetworkData {
  char *ssid;
  char *password;
};

void turn_off() {
  // Relay 1 is a "master switch" so it suffices
  // to turn just it off.
  log("turning off...");
  saveCurrentAnimation(turn_off_signal);
  digitalWrite(relay1GpioPin, LOW);
}
void turn_on() {
  log("turning on...");
  saveCurrentAnimation(turn_on_signal);
  digitalWrite(relay1GpioPin, HIGH);
  animate();
}

void animate() {
  /*
  Santa Drop In sign animation:
    - Relay 1 controls overall power and turns on word "Santa"
      It remains on the entire time the animation is running.
    - Relay 2 alternates between NO and NC to turn on word "Drop" and one
  pointing hand, then "In" and the other pointing hand.
  */
  log("animating...");
  saveCurrentAnimation(animate_signal);
  digitalWrite(relay1GpioPin, HIGH);
  if (relay2IsOn) {
    relay2IsOn = false;
    digitalWrite(relay2GpioPin, LOW);
  } else {
    relay2IsOn = true;
    digitalWrite(relay2GpioPin, HIGH);
  }
}

void saveCurrentAnimation(char *theFunction) {
  if (strcmp(theFunction, "turn_off") == 0) {
    currentAnimation = turn_off;
  } else if (strcmp(theFunction, "turn_on") == 0) {
    currentAnimation = turn_on;
  } else if (strcmp(theFunction, "animate") == 0) {
    currentAnimation = animate;
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
  if (strcmp(message, (char *)"off") == 0) {
    saveCurrentAnimation(turn_off_signal);
    return;
  }
  if (strcmp(message, (char *)"on") == 0) {
    saveCurrentAnimation(turn_on_signal);
    return;
  }
  if (strcmp(message, (char *)"animate") == 0) {
    saveCurrentAnimation(turn_on_signal);
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
  enableLogging();
  delay(250);

  pinMode(relay1GpioPin, OUTPUT);
  pinMode(relay2GpioPin, OUTPUT);

  connectToNetwork();
  saveCurrentAnimation(turn_on_signal);  // should be turn_off_signal
  currentAnimation = turn_on;
  currentAnimation();
}

void loop() {
  EVERY_N_SECONDS(1) {
    monitorWiFi();
  }
  mqttClient.loop();    // this is ESSENTIAL for MQTT messages to be received!
  ArduinoOTA.handle();  // check for & handle OTA update requests

  EVERY_N_MILLISECONDS(loopDelay) {
    currentAnimation();
  }
}
