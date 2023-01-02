/*
  ************************************************
  YOU SHOULD NOT NEED TO MODIFY THIS FILE OF UTILITY
  AND NETWORKING FUNCTIONS.
  ************************************************
*/

#include <Arduino.h>
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

boolean loggingEnabled = false;
WiFiClient wifiClient;
boolean connectioWasAlive = true;
int notConnectedRetryCount = 0;

// Create an NTP client so we can get the current time
WiFiUDP ntpUDP;
// Ping NTP server no more than every 5 minutes
#define NTP_UPDATE_THROTTLE_MILLLISECONDS (5UL * 60UL * 60UL * 1000UL)
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds,
                     NTP_UPDATE_THROTTLE_MILLLISECONDS);

PubSubClient mqttClient(wifiClient);

/**********************************************************
  UTILITY AND LOGGING FUNCTIONS
***********************************************************/

void enableLogging() {
  Serial.begin(115200);
  loggingEnabled = true;
  Serial.println('\n');
}

void disableLogging() {
  loggingEnabled = false;
  Serial.end();
}

void log(String message = "", bool withNewLine = true) {
  if (loggingEnabled) {
    Serial.print(message);
    if (withNewLine) {
      Serial.print('\n');
    }
  }
}

void log(char message[] = "", bool withNewLine = true) {
  String str = String(message);
  log(str, withNewLine);
}

void log(std::string message = "", bool withNewLine = true) {
  String str = message.c_str();
  log(str, withNewLine);
}

std::vector<std::string> split(char text[], char delimiter[] = ":") {
  std::vector<std::string> subStrings;
  char* tok;

  tok = strtok(text, delimiter);

  // Checks for delimeter
  while (tok != 0) {
    subStrings.push_back(tok);
    tok = strtok(0, delimiter);
  }
  return subStrings;
}

void to_lowercase(char* input) {
  if (*input == 0) {
    return;
  }

  if (*input >= 'A' && *input <= 'Z') {
    *input += 32;  // convert capital letter to lowercase
  }
  to_lowercase(++input);  // simply move to next char in array
}

/**********************************************************
  NETWORK RELATED FUNCTIONS
***********************************************************/
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

void connectToNetwork(
    std::function<void(char* topic, byte* payload, unsigned int length)>
        handleMqttMessage) {
  // Network setup
  WiFi.mode(WIFI_STA);
  WiFi.setSleepMode(WIFI_NONE_SLEEP);
  WiFi.begin(ssid, password);
  mqttClient.setServer(brokerHostname, 1883);
  mqttClient.setCallback(handleMqttMessage);

  while (WiFi.status() != WL_CONNECTED) {
    if (notConnectedRetryCount < notConnectedMaxRetries) {
      notConnectedRetryCount += 1;
      delay(1000);
      log('.');
    } else {
      ESP.restart();
    }
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
  ArduinoOTA.onEnd([]() { log("End OTA update"); });
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
  while (WiFi.status() != WL_CONNECTED) {
    if (notConnectedRetryCount < notConnectedMaxRetries) {
      notConnectedRetryCount += 1;
      delay(100);
      log("WiFi not connected, retrying...");
    } else {
      ESP.restart();
    }
  }
  MDNS.notifyAPChange();
  MDNS.update();
  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  timeClient.update();
  // TODO -- use the time that was returned, see
  // https://github.com/arduino-libraries/NTPClient/blob/master/NTPClient.h
}