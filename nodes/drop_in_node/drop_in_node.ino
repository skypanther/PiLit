/*
   ESP8266 code to control one-channel relays (on/off switches)
    - Network connection code
    - MQTT subscriber code
*/

#include <string>

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
#define MAX_MESSAGE_LENGTH 128

#define relay1GpioPin 1                      // Change this to match the GPIO pin you're using
#define relay2GpioPin 3                      // Change this to match the GPIO pin you're using
#define relay3GpioPin 4                      // Change this to match the GPIO pin you're using
#define relay4GpioPin 5                      // Change this to match the GPIO pin you're using


// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname = "dropin";                  // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "onoffnodes",
  "dropin"
};
char *brokerHostname = "northpole.local";  // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *net1_ssid = "WIFI_NETWORK_SSID";
char *net1_password = "PASSWORD";
//char *net2_ssid = "WIFI_NETWORK_SSID";
//char *net2_password = "PASSWORD";

uint16_t loopDelay = 10;     // Time (ms) between calls to loop(), probably best to leave as-is

// XXXXXXXXXX  DON'T CHANGE ANYTHING BELOW THIS IN THIS FILE  XXXXXXXXXX

std::function<void(void)> currentAnimation;

struct NetworkData {
  char *ssid;
  char *password;
};

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;
bool relaysAreOn = false;
bool isAnimating = false;

void turn_off() {
  log("turning off...");
  saveCurrentAnimation("turn_off");
  isAnimating = false;
  relaysAreOn = false;
  digitalWrite(relay1GpioPin, LOW);
  digitalWrite(relay2GpioPin, LOW);
  digitalWrite(relay3GpioPin, LOW);
  digitalWrite(relay4GpioPin, LOW);
}
void turn_on() {
  log("turning on...");
  saveCurrentAnimation("turn_on");
  relaysAreOn = true;
  digitalWrite(relay1GpioPin, HIGH);
  digitalWrite(relay2GpioPin, HIGH);
  digitalWrite(relay3GpioPin, HIGH);
  digitalWrite(relay4GpioPin, HIGH);
}
void toggle() {
  saveCurrentAnimation("toggle");
  if (relaysAreOn) {
    log("turning off...");
    relaysAreOn = false;
    digitalWrite(relay1GpioPin, LOW);
    digitalWrite(relay2GpioPin, LOW);
    digitalWrite(relay3GpioPin, LOW);
    digitalWrite(relay4GpioPin, LOW);
  } else {
    log("turning on...");
    relaysAreOn = true;
    digitalWrite(relay1GpioPin, HIGH);
    digitalWrite(relay2GpioPin, HIGH);
    digitalWrite(relay3GpioPin, HIGH);
    digitalWrite(relay4GpioPin, HIGH);
  }
}

void animate() {
  /*
  Santa Drop In sign animation:
    - Relay 1 controls word "Santa" and is always on
    - Relay 2 controls word "Drop" and one pointing hand
    - Relay 3 controls word "In" and other pointing hand
    - Relay 4 not used
    - relays 3 and 4 alternate on/off every second
  */
  log("animating...");
  saveCurrentAnimation("animate");
  digitalWrite(relay1GpioPin, HIGH);
  if (relaysAreOn) {
    relaysAreOn = false;
    digitalWrite(relay2GpioPin, HIGH);
    digitalWrite(relay3GpioPin, LOW);
  } else {
    relaysAreOn = true;
    digitalWrite(relay2GpioPin, LOW);
    digitalWrite(relay3GpioPin, HIGH);
  }
  delay(900);
}

void saveCurrentAnimation(char *theFunction) {
  if (strcmp(theFunction, "turn_off") == 0) {
    currentAnimation = turn_off;
  } else if (strcmp(theFunction, "turn_on") == 0) {
    currentAnimation = turn_on;
  } else if (strcmp(theFunction, "toggle") == 0) {
    currentAnimation = toggle;
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
  log("message: ", false);log(message);
  if (strcmp(message, (char *)"off") == 0) {
    saveCurrentAnimation("turn_off");
    return;
  }
  if (strcmp(message, (char *)"on") == 0) {
    saveCurrentAnimation("turn_on");
    return;
  }
  if (strcmp(message, (char *)"toggle") == 0) {
    saveCurrentAnimation("toggle");
    return;
  }
  if (strcmp(message, (char *)"animate") == 0) {
    saveCurrentAnimation("animate");
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
  pinMode(relay1GpioPin, OUTPUT);
  pinMode(relay2GpioPin, OUTPUT);
  pinMode(relay3GpioPin, OUTPUT);
  pinMode(relay4GpioPin, OUTPUT);
  NetworkData net1, net2;
  net1.ssid = net1_ssid;
  net1.password = net1_password;
//  net2.ssid = net2_ssid;
//  net2.password = net2_password;
  NetworkData networks[] = {net1};
  enableLogging();
  connectToNetwork(wifiMulti, hostname, networks, 1);
  mqttClient.setServer(brokerHostname, 1883);
  mqttClient.setCallback(handleMqttMessage);
}

void loop() {
  monitorWiFi(wifiMulti);
  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  mqttClient.loop();  // this is ESSENTIAL!
  currentAnimation();
  delay(loopDelay);
}
