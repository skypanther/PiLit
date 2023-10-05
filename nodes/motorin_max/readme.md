# Motorin' Max

I have a decoration where Max the dog moves back and forth like the scene in the Grinch TV special where he's catching the bags that the Grinch tosses off the roof. My original plan was to use a single controller to manage both the animated lights (multiple relays) and the motor. Because of size and build constraints, it ended up being easier having separate controllers.

This sketch here controls the motor that drives Max back and forth. I use a pair of magnetic reed switches to sense when Max has moved to the ends of the track, then the motor is turned in the opposite direction. This is certainly not foolproof, but Max has yet to drive off the end of the track for me.

I use [this Noyito motor controller](https://www.amazon.com/gp/product/B082VS65BZ), though I'm sure others would work just fine. I use a 12v DC motor. I use an old laptop power supply that outputs 14v DC. The Noyito board is fine with that and steps that down to 12v automatically for the motors. I power the ESP board from a DC-DC converter that outputs 5v. All this fits in a 3D printed box which is mounted to the rail on which a rack and pinion gear set is used to drive Max.
