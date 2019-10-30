/*
   ESP8266 code to control RGB pixel strips
    - Network connection code
    - MQTT subscriber code
    - FastLED based pixel control code
*/

#define FASTLED_ESP8266_NODEMCU_PIN_ORDER

#include <string>
#include <unordered_map>

#include <ESP8266mDNS.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <WiFiServerSecure.h>
#include <WiFiUdp.h>

#include <PubSubClient.h>               // MQTT library
#include "lightsequences.h"             // FastLED/pixel control library
#include "utils.h"                      // General utilities

#define MAX_MESSAGE_LENGTH 128

struct NetworkData {
  char *ssid;
  char *password;
};


// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname = "xmas";                    // The hostname of this device -- eg. thishost.local
String topics[] = {                         // Create an array of topics to subscribe to
  "all",                                    // add as many topics as necessary
  "arches"
};
char *brokerHostname = "192.168.1.3";       // Hostname/IP address of the MQTT broker
char *net1_ssid = "poulsen";
char *net1_password = "PASSWORD";
char *net2_ssid = "poulsen2";
char *net2_password = "PASSWORD";
const uint16_t loopInterval = 20;         // Time (ms) between calls to animation function

// XXXXXXXXXX  DON'T CHANGE ANYTHING BELOW THIS IN THIS FILE  XXXXXXXXXX

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;

char valid_colors[] = "white snow silver gray grey darkGray darkGrey black White Snow Silver Gray Grey DarkGray DarkGrey Black red crimson darkMagenta darkRed magenta maroon Red Crimson DarkMagenta DarkRed Magenta Maroon orange orangeRed darkOrange Orange OrangeRed DarkOrange yellow gold Yellow Gold green lime darkGreen forestGreen Green Lime DarkGreen ForestGreen cyan darkCyan Cyan DarkCyan blue deepSkyBlue royalBlue skyBlue darkBlue navy Blue DeepSkyBlue RoyalBlue SkyBlue DarkBlue Navy blueViolet purple violet indigo darkViolet BlueViolet Purple Violet Indigo DarkViolet";
char valid_functions[] = "solid_color center_out edges_in slinky slinky_backwards bounce";
char delim[] = ":";
char *current_color = "black";
std::function<void(void)> currentAnimation = solid_color;


void saveCurrentAnimation(char *theFunction) {
  if (strcmp(theFunction, "solid_color") == 0) {
    currentAnimation = solid_color;
    log("currentAnimate = solid_color");    
  } else if (strcmp(theFunction, "center_out") == 0) {
    currentAnimation = center_out;
    log("currentAnimate = center_out");    
  } else if (strcmp(theFunction, "edges_in") == 0) {
    currentAnimation = edges_in;
    log("currentAnimate = edges_in");    
  } else if (strcmp(theFunction, "slinky") == 0) {
    currentAnimation = slinky;
    log("currentAnimate = slinky");    
  } else if (strcmp(theFunction, "slinky_backwards") == 0) {
    currentAnimation = slinky_backwards;
    log("currentAnimate = slinky_backwards");    
  } else if (strcmp(theFunction, "bounce") == 0) {
    currentAnimation = bounce;
    log("currentAnimate = bounce");    
  } else {
    log("no matching function name found");    
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
  if (length < 9 || !strstr(message, delim)) {
    // shortest color = red, shortest anim func = bounce = 9
    // and messages are in the form color:func_name
    // so bail out if either of these conditions fails
    return;
  }
  // split it into a color:animation pair
  std::vector<std::string> results;
  results = split(message, delim);
  if (results.size() != 2) return;
  // results[0] should be a color name
  char *theColor = const_cast<char*>(results[0].c_str());
  char *theFunction = const_cast<char*>(results[1].c_str());
  log("theColor: ", false);
  log(theColor);
  log("theFunction: ", false);
  log(theFunction);
  if (strstr(valid_colors, theColor)) {
    current_color = theColor;
  }
  if (strstr(valid_functions, theFunction)) {
    saveCurrentAnimation(theFunction);
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
      log("failed");
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
  log("mDNS responder started");
}

void monitorWiFi(ESP8266WiFiMulti wifiMulti) {
  if (wifiMulti.run() != WL_CONNECTED) {
    if (connectioWasAlive == true) {
      connectioWasAlive = false;
      log("Looking for WiFi ");
    }
    log(".", false);
    delay(500);
    MDNS.notifyAPChange();
  } else if (connectioWasAlive == false) {
    connectioWasAlive = true;
    log(" connected to " + WiFi.SSID());
  }
  // Calling update() is key to getting the ESP8266 to respond to hostname.local
  MDNS.update();
}

void setup() {
  lightsequences_setup();
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
  // this is ESSENTIAL!
  mqttClient.loop();
  // these functions in lightsequences will take care of ignoring bad color/function names
  set_color(current_color);
  currentAnimation();
  // idle
      delay(500);
}
