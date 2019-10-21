/*

// Address subsets of the array by using CRGBSet. e.g. could be used to easily address groups of pixels. Or, use it to mirror a lighting sequence
// https://github.com/FastLED/FastLED/wiki/RGBSet-Reference

// What if you want a mirrored type effect? You could replace your loop line with something like this:

void loop() { 
  static uint8_t hue=0;
  leds(0,NUM_LEDS/2 - 1).fill_rainbow(hue++);  // fill the first 20 items with a rainbow
  leds(NUM_LEDS/2, NUM_LEDS-1) = leds(NUM_LEDS/2-1,0);
  FastLED.delay(30);
}
// more examples at
// https://www.reddit.com/r/FastLED/comments/d8u42w/offsetting_data_within_one_strip/f1d7dje/?utm_source=share&utm_medium=web2x


// Address an array of LEDs backwards
int reverseMap(int idx) {
    return (NUM_LEDS - 1 - idx);
}
leds[reverseMap(thispos)] = CRGB::Red; // set the led red

*/