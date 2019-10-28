/*
	A few simple utility functions
*/

#include <Arduino.h>
#include <string>

boolean loggingEnabled = false;

void enableLogging() {
    Serial.begin(115200);
    loggingEnabled = true;
    Serial.println('\n');
}

void disableLogging() {
	loggingEnabled = false;
	Serial.end();
}


void log(String message="", bool withNewLine=true) {
  if (loggingEnabled) {
        Serial.print(message);
    if (withNewLine) {
      Serial.print('\n');
    }
  }
}

void log(char message[]="", bool withNewLine=true) {
  String str = String(message);
  log(str, withNewLine);
}

void log(std::string message = "", bool withNewLine = true) {
  String str = message.c_str();
  log(str, withNewLine);
}

std::vector<std::string> split(char text[], std::string delimiter) {
  std::vector<std::string> subStrings;
  // Declaration of delimiter 
  const char s[4] = ":"; 
  char* tok;
  
  tok = strtok(text, s); 
  
  // Checks for delimeter 
  while (tok != 0) { 
    subStrings.push_back(tok);
      tok = strtok(0, s); 
  }
  return subStrings; 
} 
