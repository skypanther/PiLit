#include <FastLED.h>
#include <string>
#include <unordered_map>

#define LED_TYPE APA102
#define DATA_PIN 5
#define CLOCK_PIN 4
#define NUM_LEDS 100
#define COLOR_ORDER BGR
#define BRIGHTNESS 50
CRGB leds[NUM_LEDS];

#define FASTLED_ESP8266_NODEMCU_PIN_ORDER

int16_t positionRed = 0;   // Set initial start position of Red pixel
int16_t positionWhite = 1; // Set initial start position of White pixel
int16_t positionBlue = 2;  // Set initial start position of Blue pixel
int8_t delta = 1;          // Using a negative value will move pixels backwards.
uint16_t holdTime = 20;    // Milliseconds to hold position before advancing

int16_t slinkyPosition = 1;
int16_t edgesCenterPosition = 0;

CRGB currentColor = CRGB::Black;

//
// Lookup table of colors - to convert string to CRGB reference
//
std::unordered_map<std::string, CRGB> colorTable = {
  // white -- gray -- black
  {"White", CRGB::White},
  {"Snow", CRGB::Snow},
  {"Silver", CRGB::Silver},
  {"Gray", CRGB::Gray},
  {"Grey", CRGB::Grey},
  {"DarkGray", CRGB::DarkGray},
  {"DarkGrey", CRGB::DarkGrey},
  {"Black", CRGB::Black},
  
  // reds
  {"Red", CRGB::Red},
  {"Crimson", CRGB::Crimson},
  {"DarkMagenta", CRGB::DarkMagenta},
  {"DarkRed", CRGB::DarkRed},
  {"Magenta", CRGB::Magenta},
  {"Maroon", CRGB::Maroon},
  
  {"Orange", CRGB::Orange},
  {"OrangeRed", CRGB::OrangeRed},
  {"DarkOrange", CRGB::DarkOrange},
  
  {"Yellow", CRGB::Yellow},
  {"Gold", CRGB::Gold},
  
  {"Green", CRGB::Green},
  {"Lime", CRGB::Lime},
  {"DarkGreen", CRGB::DarkGreen},
  {"ForestGreen", CRGB::ForestGreen},
  
  {"Cyan", CRGB::Cyan},
  {"DarkCyan", CRGB::DarkCyan},
  
  {"Blue", CRGB::Blue},
  {"DeepSkyBlue", CRGB::DeepSkyBlue},
  {"RoyalBlue", CRGB::RoyalBlue},
  {"SkyBlue", CRGB::SkyBlue},
  {"DarkBlue", CRGB::DarkBlue},
  {"Navy", CRGB::Navy},
  
  {"BlueViolet", CRGB::BlueViolet},
  {"Purple", CRGB::Purple},
  {"Violet", CRGB::Violet},
  {"Indigo", CRGB::Indigo},
  {"DarkViolet", CRGB::DarkViolet}
};

//
// Create a lookup table of functions - so the MQTT server can send the name
// of a function to be run on the ESP8266
//

typedef void (*ScriptFunction)(); // function pointer type
typedef std::unordered_map<std::string, ScriptFunction> scriptMap;
scriptMap functionsList;  // see the end of the file where this is populated

void call_function(const std::string& funcName) {
    auto iter = functionsList.find(funcName);
    if (iter == functionsList.end()) {
        set_color("black");
        solid_color();
        return;
    }
    (*iter->second)();
}


void setup() {
  Serial.begin(115200);
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  delay(3000); // Startup delay
  FastLED.addLeds<LED_TYPE, DATA_PIN, CLOCK_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  functionsList.emplace("solid_color", &solid_color);
  functionsList.emplace("center_out", &center_out);
  functionsList["edges_in"] = &edges_in;

}

void loop() {
  EVERY_N_MILLISECONDS(holdTime) {
    set_color("purple");
    call_function("solid_color");
  }
}

//
// Helper functions
//

void set_color(std::string colorName) {
  if (colorTable.count(colorName) > 0) {
    currentColor = colorTable[colorName];
  }  
}

//
// LED pattern functions
//
void solid_color() {
  FastLED.showColor(currentColor);
}

void center_out() {
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i <= NUM_LEDS/2+edgesCenterPosition && i >= NUM_LEDS/2-edgesCenterPosition) {
      leds[i] = CRGB::Red;
    } else {
      leds[i] = CRGB::Black;
    }
  }
  FastLED.show();

  edgesCenterPosition = edgesCenterPosition + delta;
  
  if (edgesCenterPosition > NUM_LEDS/2+1) {
    Serial.println("Reverse ... towards pos 0");
    edgesCenterPosition -= 1;
    delta = -1;
    delay(holdTime*10);
  } else if (edgesCenterPosition < -1) {
    Serial.println("Forward we go!");
    edgesCenterPosition += 1;
    delta = 1;
    delay(holdTime*10);
  }
}

void edges_in() {
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i <= edgesCenterPosition || i>=NUM_LEDS-(edgesCenterPosition+1)) {
      leds[i] = CRGB::Red;
    } else {
      leds[i] = CRGB::Black;
    }
  }
  FastLED.show();

  edgesCenterPosition = edgesCenterPosition + delta;
  
  if (edgesCenterPosition > NUM_LEDS/2+1) {
    Serial.println("Reverse ... towards pos 0");
    edgesCenterPosition -= 1;
    delta = -1;
    delay(holdTime);
  } else if (edgesCenterPosition < -1) {
    Serial.println("Forward we go!");
    edgesCenterPosition += 1;
    delta = 1;
    delay(holdTime);
  }
}


void slinky_backwards() {
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i > slinkyPosition) {
      leds[i] = CRGB::Red;
    } else {
      leds[i] = CRGB::Black;
    }
  }
  FastLED.show();

  if (slinkyPosition == NUM_LEDS - 1) {
    Serial.println("Reverse ... towards pos 0");
    delta = -1;
    delay(holdTime);
  } else if (slinkyPosition == 0) {
    Serial.println("Forward we go!");
    delta = 1;
    delay(holdTime);
  }
  slinkyPosition = (slinkyPosition + delta + NUM_LEDS) % NUM_LEDS;
}

void slinky() {
  for (int i = 0; i < NUM_LEDS; i++) {
    if (i <= slinkyPosition) {
      leds[i] = CRGB::Red;
    } else {
      leds[i] = CRGB::Black;
    }
  }
  FastLED.show();

  if (slinkyPosition == NUM_LEDS - 1) {
    Serial.println("Reverse ... towards pos 0");
    delta = -1;
  } else if (slinkyPosition == 0) {
    Serial.println("Forward we go!");
    delta = 1;
  }
  slinkyPosition = (slinkyPosition + delta + NUM_LEDS) % NUM_LEDS;
}

void bounce() {
  return;
  // Set pixel color
  leds[positionRed] = CRGB::Red;
  leds[positionWhite] = CRGB::Red;
  leds[positionBlue] = CRGB::Red;

  // Show the pixels
  FastLED.show();

  // Set pixels back to Black for the next loop around.
  leds[positionRed] = CRGB::Black;
  leds[positionWhite] = CRGB::Black;
  leds[positionBlue] = CRGB::Black;

  // Set new position, moving (forward or backward) by delta.
  // NUM_LEDS is added to the position before doing the modulo
  // to cover cases where delta is a negative value.
  if (positionBlue == NUM_LEDS - 1) {
    Serial.println("Reverse ... towards pos 0");
    delta = -1;
  } else if (positionBlue == 1) {
    Serial.println("Forward we go!");
    delta = 1;
  }
  positionRed = (positionRed + delta + NUM_LEDS) % NUM_LEDS;
  positionWhite = (positionWhite + delta + NUM_LEDS) % NUM_LEDS;
  positionBlue = (positionBlue + delta + NUM_LEDS) % NUM_LEDS;
}
