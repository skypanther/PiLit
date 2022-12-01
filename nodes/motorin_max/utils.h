#include <Arduino.h>
#include <string.h>

void enableLogging();
void disableLogging();
void log(String message = "", bool withNewLine = true);
void log(int message = 0, bool withNewLine = true);
std::vector<std::string> split(char text[], char delimiter[]=":");
void to_lowercase(char* input);
