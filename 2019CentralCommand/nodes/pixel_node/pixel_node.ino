/*
 * ESP8266 code to control RGB pixel strips
 *  - Network connection code
 *  - MQTT subscriber code
 *  - FastLED based pixel control code
*/

#include <string>
#include <unordered_map>

#include <ESP8266mDNS.h>
#include <ESP8266mDNS_Legacy.h>
#include <LEAmDNS.h>
#include <LEAmDNS_Priv.h>
#include <LEAmDNS_lwIPdefs.h>

#include <BearSSLHelpers.h>
#include <CertStoreBearSSL.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiAP.h>
#include <ESP8266WiFiGeneric.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266WiFiSTA.h>
#include <ESP8266WiFiScan.h>
#include <ESP8266WiFiType.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClientSecureAxTLS.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiServer.h>
#include <WiFiServerSecure.h>
#include <WiFiServerSecureAxTLS.h>
#include <WiFiServerSecureBearSSL.h>
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
char *net1_password = "PASSWORD_HERE";
char *net2_ssid = "poulsen2";
char *net2_password = "PASSWORD_HERE";
const uint16_t loopInterval = 20;         // Time (ms) between calls to animation function

// XXXXXXXXXX  DON'T CHANGE ANYTHING BELOW THIS IN THIS FILE  XXXXXXXXXX

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;

char *current_color = "black";
char *currentAnimation = "solid_color";

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
    // split it into a color:animation pair
    std::vector<std::string> results;
    results = split(message, ":");
    // results[0] should be a color name
    current_color = const_cast<char*>(results[0].c_str());
    // results[1] should be the animation function to run
    currentAnimation = const_cast<char*>(results[1].c_str());
    log(current_color);
    log(currentAnimation);
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

void connectToNetwork(ESP8266WiFiMulti wifiMulti, char *hostname, NetworkData networks[], int num_elems=0) {
  if (num_elems == 0) {
    return;
  }
    for (int i=0; i<num_elems; i++) {
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
    run_animation(currentAnimation);
    // idle
    delay(500);
}
