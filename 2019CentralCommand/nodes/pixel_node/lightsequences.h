#define FASTLED_ESP8266_NODEMCU_PIN_ORDER
#include <FastLED.h>
#include <string>

void lightsequences_setup();
void set_color(char *colorName);
//void run_animation(char *funcName);

void solid_color();
void center_out();
void edges_in();
void slinky();
void slinky_backwards();
void bounce();
