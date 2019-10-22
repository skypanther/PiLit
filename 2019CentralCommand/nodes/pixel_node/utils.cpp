/*
	A few simple utility functions
*/

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

#include <Arduino.h>
#include <string>

boolean loggingEnabled = false;
boolean connectioWasAlive = true;

struct NetworkData {
    char *ssid;
    char *password;
};

void enableLogging() {
    Serial.begin(115200);
    loggingEnabled = true;
    Serial.println('\n');
}

void disableLogging() {
	loggingEnabled = false;
	Serial.end();
}


void log(std::string message = "", bool withNewLine = true) {
	if (loggingEnabled) {
        Serial.print(message);
		if (withNewLine) {
			Serial.print('\n');
		}
    }
}

void connectToNetwork(ESP8266WiFiMulti wifiMulti, std::string hostname, NetworkData networks[], int num_elems=0) {
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
