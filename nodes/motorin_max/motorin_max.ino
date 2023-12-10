/*
   ESP8266 code to control a motorized display (my use is
   a motor that drives a decoration back and forth)

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
char *debug_signal = "debug";
int switch_state = LOW;
int switch_one_ID = 0;
int switch_two_ID = 1;
bool is_driving = false;


void turn_off() {
  saveCurrentAnimation(turn_off_signal);
  digitalWrite(motorControllerIn1, LOW);
  digitalWrite(motorControllerIn2, LOW);
  analogWrite(motorEnA, 0);
  is_driving = false;
}
void turn_on() {
  saveCurrentAnimation(turn_on_signal);
  if (!is_driving) {
    digitalWrite(motorControllerIn1, HIGH);
    digitalWrite(motorControllerIn2, LOW);
    analogWrite(motorEnA, motor_speed);
  }
  is_driving = true;
}

void saveCurrentAnimation(char *theFunction) {
  current_function = theFunction;  // save the name (str) of the function
  if (strcmp(theFunction, "turn_off") == 0) {
    currentAnimation = turn_off;
  } else if (strcmp(theFunction, "turn_on") == 0 || strcmp(theFunction, "debug") == 0) {
    currentAnimation = turn_on;
  } else {
    currentAnimation = turn_off;
  }
}

void switch_trigger(uint16_t sw_num) {
  if (current_function == turn_off_signal) {
    // make sure motor is off, then return
    log("Shutting down...");
    turn_off();
    return;
  }
  static unsigned long last_interrupt_time = 0;
  unsigned long interrupt_time = millis();
  if (interrupt_time - last_interrupt_time > debounceWaitTime) {
    if (sw_num == switch_one_ID) {
      log("going forward");
      digitalWrite(motorControllerIn1, HIGH);
      digitalWrite(motorControllerIn2, LOW);
    } else {
      log("going in reverse");
      digitalWrite(motorControllerIn1, LOW);
      digitalWrite(motorControllerIn2, HIGH);
    }
    analogWrite(motorEnA, motor_speed);
  }
  // update the time in case we're in a debounce time
  last_interrupt_time = interrupt_time;
}

void IRAM_ATTR sw1_trigger() {
  log("sw1_trigger");
  switch_trigger(switch_one_ID);
}

void IRAM_ATTR sw2_trigger() {
  log("sw2_trigger");
  switch_trigger(switch_two_ID);
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
    saveCurrentAnimation(turn_off_signal);
    return;
  }
  if (strcmp(message, (char *)"on") == 0 || strcmp(message, (char *)"turn_on") == 0) {
    saveCurrentAnimation(turn_on_signal);
    return;
  }
  if (strcmp(message, (char *)"debug") == 0) {
    saveCurrentAnimation(debug_signal);
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
  pinMode(motorEnA, OUTPUT);
  pinMode(motorControllerIn1, OUTPUT);
  pinMode(motorControllerIn2, OUTPUT);
  pinMode(switchOne, INPUT_PULLUP);  // Basically, I'm using ez_switch_lib's C2 circuit
  pinMode(switchTwo, INPUT_PULLUP);  // for both switches

  connectToNetwork();
  saveCurrentAnimation(turn_off_signal);  // should be turn_off_signal
  currentAnimation = turn_off;
  currentAnimation();

  // attach interrupts to listen for mag switch changes
  // by attaching to rising, we'll respond only when the switch is turned on
  // and igonre when it's turned off
  attachInterrupt(digitalPinToInterrupt(switchOne), sw1_trigger, RISING);
  attachInterrupt(digitalPinToInterrupt(switchTwo), sw2_trigger, RISING);

  // start motor going in one direction to kick things off
  delay(250);
  // Start motor initially ... hopefully it's going the right direction to not go off the track
  digitalWrite(motorControllerIn1, LOW);
  digitalWrite(motorControllerIn2, HIGH);
  analogWrite(motorEnA, motor_speed);
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
