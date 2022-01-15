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

#define gpioPin 5 // Change this to match the GPIO pin you're using

// ------> CONFIGURE THESE VARIABLES TO MATCH YOUR SETUP  <------
char *hostname = "relay6"; // The hostname of this device -- eg. thishost.local
String topics[] = {        // Create an array of topics to subscribe to
    "all",                 // add as many topics as necessary
    "onoffnodes",
    "relay6"};
char *brokerHostname = "northpole.local"; // or "192.168.1.6";  // Hostname/IP address of the MQTT broker
char *net1_ssid = "WIFI_NETWORK_SSID";
char *net1_password = "PASSWORD";
//char *net2_ssid = "WIFI_NETWORK_SSID";
//char *net2_password = "PASSWORD";

uint16_t loopDelay = 10; // Time (ms) between calls to loop(), probably best to leave as-is

// XXXXXXXXXX  DON'T CHANGE ANYTHING BELOW THIS IN THIS FILE  XXXXXXXXXX

struct NetworkData
{
  char *ssid;
  char *password;
};

ESP8266WiFiMulti wifiMulti;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
boolean connectioWasAlive = true;
bool switchIsCurrentlyOn = false;

void turn_off()
{
  log("turning off...");
  digitalWrite(gpioPin, LOW);
  switchIsCurrentlyOn = false;
}
void turn_on()
{
  log("turning on...");
  digitalWrite(gpioPin, HIGH);
  switchIsCurrentlyOn = true;
}
void toggle()
{
  if (switchIsCurrentlyOn)
  {
    log("turning off...");
    digitalWrite(gpioPin, LOW);
    switchIsCurrentlyOn = false;
  }
  else
  {
    log("turning on...");
    digitalWrite(gpioPin, HIGH);
    switchIsCurrentlyOn = true;
  }
}

void handleMqttMessage(char *topic, byte *payload, unsigned int length)
{
  char message[MAX_MESSAGE_LENGTH + 1];
  if (length > MAX_MESSAGE_LENGTH)
  {
    length = MAX_MESSAGE_LENGTH;
  }
  // convert the type *payload to a string
  strncpy(message, (char *)payload, length);
  message[length] = '\0';
  log("message: ", false);
  log(message);
  if (strcmp(message, (char *)"off") == 0)
  {
    turn_off();
    return;
  }
  if (strcmp(message, (char *)"on") == 0)
  {
    turn_on();
    return;
  }
  if (strcmp(message, (char *)"toggle") == 0)
  {
    toggle();
    return;
  }
}

void mqttReconnect()
{
  // Loop until we're reconnected
  while (!mqttClient.connected())
  {
    log("Attempting MQTT connection...");
    // Attempt to connect
    if (mqttClient.connect(hostname))
    {
      log("connected");
      for (String topic : topics)
      {
        log("Subscribing to:", false);
        log(topic);
        mqttClient.subscribe(topic.c_str());
      }
    }
    else
    {
      // log("failed");
      delay(1000);
    }
  }
}

void connectToNetwork(ESP8266WiFiMulti wifiMulti, char *hostname, NetworkData networks[], int num_elems = 0)
{
  if (num_elems == 0)
  {
    return;
  }
  for (int i = 0; i < num_elems; i++)
  {
    wifiMulti.addAP(networks[i].ssid, networks[i].password);
  }
  log("Connecting ", false);
  while (wifiMulti.run() != WL_CONNECTED)
  {
    delay(1000);
    log('.');
  }
  log('\n');
  log("Network:\t" + WiFi.SSID());
  log("IP address:\t" + WiFi.localIP().toString());

  if (!MDNS.begin(hostname))
  { // Start the mDNS responder for esp8266.local
    log("Error setting up MDNS responder!");
  }
  // log("mDNS responder started");
}

void monitorWiFi(ESP8266WiFiMulti wifiMulti)
{
  if (wifiMulti.run() != WL_CONNECTED)
  {
    if (connectioWasAlive == true)
    {
      connectioWasAlive = false;
      // log("Looking for WiFi ");
    }
    // log(".", false);
    delay(500);
    MDNS.notifyAPChange();
  }
  else if (connectioWasAlive == false)
  {
    connectioWasAlive = true;
    // log(" connected to " + WiFi.SSID());
  }
  // Calling update() is key to getting the ESP8266 to respond to hostname.local
  MDNS.update();
}

void setup()
{
  Serial.begin(115200);
  pinMode(gpioPin, OUTPUT);
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

void loop()
{
  monitorWiFi(wifiMulti);
  if (!mqttClient.connected())
  {
    mqttReconnect();
  }
  mqttClient.loop(); // this is ESSENTIAL!
  delay(loopDelay);
}
