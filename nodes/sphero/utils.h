#include <Arduino.h>
#include <string.h>
#include <unordered_map>

void enableLogging();
void disableLogging();
void log(String message = "", bool withNewLine = true);
std::vector<std::string> split(char text[], char delimiter[] = ":");
void to_lowercase(char* input);

//
// Lookup table of colors - to convert string to CRGB reference
//
std::unordered_map<std::string, CRGB> colorTable = {
  { "white", CRGB::White },
  { "snow", CRGB::Snow },
  { "silver", CRGB::Silver },
  { "gray", CRGB::Gray },
  { "grey", CRGB::Grey },
  { "darkgray", CRGB::DarkGray },
  { "darkgrey", CRGB::DarkGrey },
  { "black", CRGB::Black },

  { "red", CRGB::Red },
  { "crimson", CRGB::Crimson },
  { "darkmagenta", CRGB::DarkMagenta },
  { "darkred", CRGB::DarkRed },
  { "magenta", CRGB::Magenta },
  { "maroon", CRGB::Maroon },

  { "orange", CRGB::Orange },
  { "orangered", CRGB::OrangeRed },
  { "darkorange", CRGB::DarkOrange },

  { "yellow", CRGB::Yellow },
  { "gold", CRGB::Gold },

  { "green", CRGB::Green },
  { "lime", CRGB::Lime },
  { "darkgreen", CRGB::DarkGreen },
  { "forestgreen", CRGB::ForestGreen },

  { "cyan", CRGB::Cyan },
  { "darkcyan", CRGB::DarkCyan },

  { "blue", CRGB::Blue },
  { "deepskyblue", CRGB::DeepSkyBlue },
  { "royalblue", CRGB::RoyalBlue },
  { "skyblue", CRGB::SkyBlue },
  { "darkblue", CRGB::DarkBlue },
  { "navy", CRGB::Navy },

  { "blueviolet", CRGB::BlueViolet },
  { "purple", CRGB::Purple },
  { "violet", CRGB::Violet },
  { "indigo", CRGB::Indigo },
  { "darkviolet", CRGB::DarkViolet },
};

char valid_colors[] =
  "white snow silver gray grey darkgray darkgrey black red crimson "
  "darkmagenta darkred magenta maroon orange orangered darkorange yellow "
  "gold green lime darkgreen forestgreen cyan darkcyan blue deepskyblue "
  "royalblue skyblue darkblue navy blueviolet purple violet indigo "
  "darkviolet";
char valid_functions[] =
  "solid_color center_out edges_in slinky slinky_backwards bounce "
  "bounce_backwards circle circle_backwards flash rainbow rainbow_stripes "
  "stripes stripes_white ocean";
char delim[] = ":";