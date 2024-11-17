/*
   ESP8266/ESP32 code to control a Martha May light gun display
   in which a strip of pixel LEDs is filled, one at a time, to
   simulate shooting the lighted string of lights at the eaves.

    - Configuration is done in config.h
  License: MIT


Test with:
mosquitto_pub -h BROKER_ADDR -i publisher -t NODE_NAME -m 'on'

*/

// XXXXXXXXXXXXXXXXXXXX
// GENERALLY, ALL CONFIGURATION CAN BE DONE IN THE config.h FILE
// XXXXXXXXXXXXXXXXXXXX

#define FASTLED_ESP8266_RAW_PIN_ORDER

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
CRGB leds[NUM_LEDS];


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
char *turn_on_signal = "turn_on";
char *turn_off_signal = "turn_off";
char *animate_signal = "animate";
char *debug_signal = "debug";
bool isAnimating = false;
char *current_color = "black";
std::function<void(void)> currentAnimation;

struct NetworkData {
  char *ssid;
  char *password;
};

void turn_off() {
  log("turning off...");
  saveCurrentAnimation(turn_off_signal);
  FastLED.showColor(CRGB::Black);
  FastLED.delay(500);
}
void turn_on() {
  log("turning on...");
  saveCurrentAnimation(turn_on_signal);
  animate();
}

void animate() {
  saveCurrentAnimation(animate_signal);
  /*
  Martha May Whovier animation:
    - Pixels fill up the strip simulating the light gun
      shooting lit light strings at the house
  */
  // Draw the moving pixels.
  for (int i = 0; i < (NUM_LEDS - count); i++) {
    leds[i] = CRGB::White;
    ;
    FastLED.show();
    delay(fill_delay);  // Slow things down just a bit.
    leds[i] = CRGB::Black;
    // FastLED.show();
  }

  // Add the new filled pixels.
  leds[NUM_LEDS - 1 - count] = CRGB::White;
  ;
  FastLED.show();
  count++;

  // Delay the filling effect to slow near end.
  delta = (pow(delay_base, count) * delay_multiplier);  // Delta increases as strip fills up.
  delay(delta);                                         // Delay can increase as strip fills up.
  // Uncomment to help visualize the increasing delay.
  // Serial.print("  count:"); Serial.print(count); Serial.print("    delta: ");
  // Serial.println(delta);

  // Clear the strip when full.
  if (count == NUM_LEDS) {
    log("-------- Reset! --------");
    delay(holdDelay);  // Hold filled strip for a moment.
    FastLED.clear();
    FastLED.showColor(CRGB::Black);
    count = 0;  // Reset count.
    delay(holdDelay);
  }
}


void saveCurrentAnimation(char *theFunction) {
  if (strcmp(theFunction, turn_off_signal) == 0) {
    currentAnimation = turn_off;
  } else if (strcmp(theFunction, turn_on_signal) == 0) {
    currentAnimation = turn_on;
  } else if (strcmp(theFunction, animate_signal) == 0) {
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
  delay(3000);  // Startup delay
  pinMode(DATA_PIN, OUTPUT);
#if defined(MAX_MILLIAMPS)
  // limit power draw and voltage
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
#endif
#if defined(CLOCK_PIN)
  pinMode(CLOCK_PIN, OUTPUT);
  FastLED.addLeds<LED_TYPE, DATA_PIN, CLOCK_PIN, COLOR_ORDER>(leds, NUM_LEDS);
#else
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
#endif
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.showColor(CRGB::Black);
  enableLogging();
  log("connecting to network");
  connectToNetwork();
  saveCurrentAnimation(turn_off_signal);  // should be turn_off_signal
  currentAnimation = turn_off;
  // saveCurrentAnimation(turn_on_signal);  // should be turn_off_signal
  // currentAnimation = turn_on;
  currentAnimation();
}

void loop() {
  EVERY_N_SECONDS(1) {
    monitorWiFi();
  }
  mqttClient.loop();    // this is ESSENTIAL for MQTT messages to be received!
  ArduinoOTA.handle();  // check for & handle OTA update requests

  // EVERY_N_MILLISECONDS(loopDelay) {
  currentAnimation();
  // }
}
