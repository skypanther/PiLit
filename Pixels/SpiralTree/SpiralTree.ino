#include <FastLED.h>
#include <stdlib.h>
#include <time.h>

#define DATA_PIN      11
#define CLK_PIN       12
#define LED_TYPE      APA102
#define COLOR_ORDER   BGR
#define NUM_LEDS      268
// set BRIGHTNESS to 200 or so for final show
#define BRIGHTNESS    64
#define DELAY_BETWEEN_LOOPS 5
CRGB leds[NUM_LEDS];

CRGBPalette16 currentPalette;
TBlendType    currentBlending;
int step = 5;
int direction = 1;
int paletteCount = 0;
int paletteCountMax = 500;
int paletteNumber = 0;
int numPalettes = 17;

extern CRGBPalette16 myRedWhiteBluePalette;
extern const TProgmemPalette16 myRedWhiteBluePalette_p PROGMEM;

void setup() {
    delay( 3000 ); // power-up safety delay
    FastLED.addLeds<LED_TYPE,DATA_PIN,CLK_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
    FastLED.setBrightness(  BRIGHTNESS );
    
    currentPalette = CRGBPalette16( CRGB::Black);
    currentBlending = LINEARBLEND;
    srand(time(0));
    Serial.begin(9600);
    Serial.println("starting...");
}


void loop() {
    ChangePalettePeriodically();
    changeStepPeriodically();
    changeDirectionPeriodically();

    static uint8_t startIndex = 0;
    startIndex = (startIndex - (step * direction)); /* motion speed */
    
    FillLEDsFromPaletteColors( startIndex);
    
    FastLED.show();
    FastLED.delay(DELAY_BETWEEN_LOOPS);
}

void FillLEDsFromPaletteColors( uint8_t colorIndex) {
    for ( int i = 0; i < NUM_LEDS; i++) {
        leds[i] = ColorFromPalette( currentPalette, colorIndex, BRIGHTNESS, currentBlending);
        colorIndex += 3;
    }
}

// Gradient palette "a_gp", originally from
// http://soliton.vm.bytemark.co.uk/pub/cpt-city/ds9/tn/a.png.index.html
// converted for FastLED with gammas (2.6, 2.2, 2.5)
// Size: 28 bytes of program space.

DEFINE_GRADIENT_PALETTE( a_gp ) {
    0,   0,  0,  0,
   31,   0, 55,  0,
   63,   0,255, 45,
  127, 255,  0,255,
  163, 255,  0, 45,
  196, 255,  0,  0,
  255, 255,255,  0};

// Gradient palette "b_gp", originally from
// http://soliton.vm.bytemark.co.uk/pub/cpt-city/ds9/tn/b.png.index.html
// converted for FastLED with gammas (2.6, 2.2, 2.5)
// Size: 20 bytes of program space.

DEFINE_GRADIENT_PALETTE( b_gp ) {
    0,   0,  0,  0,
   63,   0,  0,255,
  127, 255,  0,  0,
  191, 255,255,  0,
  255, 255,255,255};

// Gradient palette "green_gp", originally from
// http://soliton.vm.bytemark.co.uk/pub/cpt-city/ds9/tn/green.png.index.html
// converted for FastLED with gammas (2.6, 2.2, 2.5)
// Size: 8 bytes of program space.

DEFINE_GRADIENT_PALETTE( green_gp ) {
    0,   0,  0,  0,
  255,   0,255,  0};

// Gradient palette "red_gp", originally from
// http://soliton.vm.bytemark.co.uk/pub/cpt-city/ds9/tn/red.png.index.html
// converted for FastLED with gammas (2.6, 2.2, 2.5)
// Size: 8 bytes of program space.

DEFINE_GRADIENT_PALETTE( red_gp ) {
    0,   0,  0,  0,
  255, 255,  0,  0};


DEFINE_GRADIENT_PALETTE( blue_gp ) {
    0,   0,  0,  0,
  255, 0,  0,  255};


// This function fills the palette with totally random colors.
void SetupTotallyRandomPalette()
{
    for( int i = 0; i < 16; i++) {
        currentPalette[i] = CHSV( random8(), 255, random8());
    }
}

// This function sets up a palette of black and white stripes,
// using code.  Since the palette is effectively an array of
// sixteen CRGB colors, the various fill_* functions can be used
// to set them up.
void SetupBlackAndWhiteStripedPalette() {
    // 'black out' all 16 palette entries...
    fill_solid( currentPalette, 16, CRGB::Black);
    // and set every fourth one to white.
    currentPalette[0] = CRGB::White;
    currentPalette[8] = CRGB::White;
}
void SetupRedAndWhiteStripedPalette() {
    // 'black out' all 16 palette entries...
    fill_solid( currentPalette, 16, CRGB::Red);
    // and set every fourth one to white.
    currentPalette[0] = CRGB::White;
    currentPalette[1] = CRGB::White;
    currentPalette[8] = CRGB::White;
    currentPalette[9] = CRGB::White;
}
void SetupRedAndBlackStripedPalette() {
    // 'black out' all 16 palette entries...
    fill_solid( currentPalette, 16, CRGB::Black);
    // and set every fourth one to Red.
    currentPalette[0] = CRGB::Red;
    currentPalette[8] = CRGB::Red;
}
void SetupGreenAndWhiteStripedPalette() {
    // 'black out' all 16 palette entries...
    fill_solid( currentPalette, 16, CRGB::White);
    // and set every fourth one to Green.
    currentPalette[0] = CRGB::Green;
    currentPalette[1] = CRGB::Green;
    currentPalette[8] = CRGB::Green;
    currentPalette[9] = CRGB::Green;
}
void SetupGreenAndBlackStripedPalette() {
    // 'black out' all 16 palette entries...
    fill_solid( currentPalette, 16, CRGB::Black);
    // and set every fourth one to Green.
    currentPalette[0] = CRGB::Green;
    currentPalette[8] = CRGB::Green;
}

// This example shows how to set up a static color palette
// which is stored in PROGMEM (flash), which is almost always more
// plentiful than RAM.  A static PROGMEM palette like this
// takes up 64 bytes of flash.
const TProgmemPalette16 redWhiteGreenPalette_p PROGMEM =
{
    CRGB::Red,
    CRGB::Gray, // 'white' is too bright compared to red and blue
    CRGB::Green,
    CRGB::Black,
    
    CRGB::Red,
    CRGB::Gray,
    CRGB::Green,
    CRGB::Black,
    
    CRGB::Red,
    CRGB::Red,
    CRGB::Gray,
    CRGB::Gray,
    CRGB::Green,
    CRGB::Green,
    CRGB::Black,
    CRGB::Black
};

void ChangePalettePeriodically() {
  if (paletteCount > paletteCountMax) {
    paletteCount = 0;
    paletteNumber++;
    if (paletteNumber == numPalettes) {
      paletteNumber = 0;
    }
  }
  paletteCount++;
  if( paletteNumber ==  0)  { currentPalette = CRGBPalette16( CRGB::Green);  currentBlending = LINEARBLEND;  }
  if( paletteNumber ==  1)  { SetupRedAndWhiteStripedPalette();         currentBlending = NOBLEND;  }
  if( paletteNumber ==  2)  { currentPalette = CRGBPalette16( CRGB::Red);   currentBlending = LINEARBLEND; }
  if( paletteNumber ==  3)  { currentPalette = ForestColors_p;           currentBlending = LINEARBLEND; }
  if( paletteNumber ==  4)  { currentPalette = red_gp;                 currentBlending = LINEARBLEND; }
  if( paletteNumber ==  5)  { currentPalette = OceanColors_p;           currentBlending = NOBLEND; }
  if( paletteNumber ==  6)  { SetupBlackAndWhiteStripedPalette();         currentBlending = NOBLEND;  }
  if( paletteNumber ==  7)  { currentPalette = LavaColors_p;            currentBlending = LINEARBLEND; }
  if( paletteNumber ==  8)  { currentPalette = blue_gp;                 currentBlending = LINEARBLEND; }
  if( paletteNumber ==  9)  { SetupGreenAndWhiteStripedPalette();         currentBlending = NOBLEND;  }
  if( paletteNumber ==  10)  { currentPalette = CRGBPalette16( CRGB::Red);   currentBlending = NOBLEND; }
  if( paletteNumber ==  11)  { currentPalette = green_gp;               currentBlending = NOBLEND;  }
  if( paletteNumber ==  12)  { SetupGreenAndBlackStripedPalette();         currentBlending = NOBLEND;  }
  if( paletteNumber ==  13)  { currentPalette = LavaColors_p;            currentBlending = NOBLEND; }
  if( paletteNumber ==  14)  { currentPalette = CRGBPalette16( CRGB::Blue);  currentBlending = LINEARBLEND;  }
  if( paletteNumber ==  15)  { currentPalette = redWhiteGreenPalette_p;     currentBlending = NOBLEND; }
  if( paletteNumber ==  16)  { SetupRedAndBlackStripedPalette();         currentBlending = NOBLEND;  }

}

int getStep() {
  int randomNum = rand() % 4 + 1;
  return randomNum;
}

int getDirection() {
  double r = ((float)rand())/RAND_MAX;
  Serial.println(r);
  if (r > 0.33) {
    return 1;
  } else {
    return -1;
  }
}

void changeStepPeriodically() {
    uint8_t secondHand = (millis() / 1000) % 60;
    static uint8_t lastSecond = 99;
    
    if( lastSecond != secondHand) {
        lastSecond = secondHand;

        if( secondHand ==  0)  {
          step = getStep();
        }
    }
}

void changeDirectionPeriodically() {
    uint8_t secondHand = (millis() / 1000) % 60;
    static uint8_t lastSecond = 99;
    
    if( lastSecond != secondHand) {
        lastSecond = secondHand;

        if( secondHand > 45)  {
          direction = getDirection();
        }
    }
}

