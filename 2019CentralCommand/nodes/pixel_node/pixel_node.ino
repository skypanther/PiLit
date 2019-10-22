/*
 * ESP8266 code to control RGB pixel strips
 *  - Network connection code
 *  - MQTT subscriber code
 *  - FastLED based pixel control code
*/

#include <string>

// MQTT library
#include <PubSubClient.h>

// Project-specific / custom libraries
#include "lightsequences.h"
#include "utils.h"

#define MAX_MESSAGE_LENGTH 128

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP
const std::string hostname = "xmas";            // The hostname of this device -- eg. thishost.local
const char *brokerHostname = "northpole";  // Hostname of the MQTT broker
const char *topic = "test/message";

constexpr unsigned int hash(const char *s, int off = 0) {
    return !s[off] ? 5381 : (hash(s, off + 1) * 33) ^ s[off];
}

void handleMqttMessage(char *topic, byte *payload, unsigned int length) {
    static char message[MAX_MESSAGE_LENGTH + 1];
    if (length > MAX_MESSAGE_LENGTH) {
        length = MAX_MESSAGE_LENGTH;
    }
    strncpy(message, (char *)payload, length);
    message[length] = '\0';

    switch (hash(message)) {
    case hash("one"): // do something
    case hash("two"): // do something
    }
}

void mqttReconnect() {
    // Loop until we're reconnected
    while (!mqttClient.connected()) {
        log("Attempting MQTT connection...");

        // Attempt to connect
        if (mqttClient.connect(hostname.c_str())) {
            log("connected");
        } else {
            log("failed, rc=", false);
            log(mqttClient.state());
            delay(1000);
        }
    }
}

void setup() {
    // CONFIGURE AS NEEDED TO MATCH YOUR NETWORK'S SSID & PASSWORD
    NetworkData net1, net2;
    net1.ssid = "poulsen";
    net1.password = "PASSWORD_GOES_HERE";
    net2.ssid = "poulsen2";
    net2.password = "PASSWORD_GOES_HERE";
    NetworkData networks[] = {net1, net2};

    // DON'T CHANGE BELOW HERE
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
    // idle
    delay(500);
}
