# Christmas Lights Controller

RaspberryPi based Christmas lights controller system using a Sainsmart 16-channel relay board.

## Design goals

I can't afford (nor would I pay if I could) the thousands of dollars it would take for a commercially-made Christmas lights control system. So, I built something super-simple instead.

My goals:

* Run on a Raspberry Pi
* Use the cheap [Sainsmart 16-channel](https://www.amazon.com/SainSmart-101-70-103-16-Channel-Relay-Module/dp/B0057OC66U/ref=sr_1_3?ie=UTF8&qid=1485741648&sr=8-3&keywords=sainsmart+relay) relay board I found on Amazon
* Let me define the lighting sequences myself
* Get this done quickly and be ready for the current Christmas season (I started the original project in mid-October)

Things that are not goals:

* Syncing the show to music
* Having a slick GUI app to create the shows
* Control the relay / lights from a PC or Mac computer

Other projects that might better meet your goals:

* [LightShow Pi](http://lightshowpi.org/)
* [Vixen Lights](http://www.vixenlights.com/)
* [xLights](https://xlights.org/)


In summary this is quick-n-dirty code and not really architected at all. Thar be dragons...

## Requirements

If you want to use this project for yourself, you will need the following:

* Raspberry Pi with a wireless adapter (I'm using the B+ since it has more than the 16 GPIO pins I needed for my board but other Pis would work)
* A relay board like listed above, 4, 8, or 16 channel boards will work
* A bunch of outlets, electrical boxes, wire, connectors, etc.
* A pack of female-to-female jumpers (you'll find a bunch of [multipacks like this on Amazon](https://www.amazon.com/gp/product/B00JUKL4XI/ref=oh_aui_detailpage_o09_s00?ie=UTF8&psc=1))
* As many [1000 ohm resistors](https://www.amazon.com/gp/product/B0185FJ6L0/ref=oh_aui_detailpage_o09_s00?ie=UTF8&psc=1) as you have relays
* Something waterproof to house the final product since it will sit outside for the holiday season. I used a large storage tub.

## Software Installation

On your Raspberry Pi:

1. Set up your Raspberry Pi and make sure it is up-to-date (with `sudo apt-get update && sudo apt-get dist-upgrade`)
2. Make sure you're running the latest version of Python with `sudo apt-get upgrade python3`
3. Install the required Python modules:
	* `sudo apt-get install python3-gpiozero python-gpiozero` 
4. Download this repo onto your Raspberry Pi
	* Preferred method: `git clone git@github.com:skypanther/clc.git`
	* Or, download the zip, extract to a clc folder in your home directory
5. If you're using Python 2 or the older Node version of this project:
	1. Add the pi user to the gpio group: `sudo usermod -a -G gpio pi`
	2. Run the following command to configure udev: 
	
	```shell
	$ sudo cat >/etc/udev/rules.d/20-gpiomem.rules <<EOF
	SUBSYSTEM=="bcm2835-gpiomem", KERNEL=="gpiomem", GROUP="gpio", MODE="0660"
	EOF
	```
	(For more info on usermod and udev steps, see [the rpio package docs](https://www.npmjs.com/package/rpio))
5. Once you have wired up your relay, update the `board_pins` list in the **runshow.py** file. (Update the `var pins=[...` line in the index.js file for the older Node version of this project.) Make sure the pin numbers there correspond to the GPIO pins you used, in the order you used them.

## Hardware setup

There was a bunch of work that went into creating my hardware setup. I'm not going to cover how to wire up outlets, mount electrical boxes, etc. In general, you'll:

* Connect the ground wire of each outlet to a common ground for the entire setup
* Connect the hot side of each outlet to one lug of the relay
* Connect the hot side of the "mains" power (power in) to the other lug of each relay.
* You'll be connecting one jumper from each GPIO pin to the pins on the Saismart relay board. You'll want to wire in a 1k ohm resister in line with each too. You'll connect a ground jumper, without resister, too.

<img src="https://github.com/skypanther/clc/blob/master/images/relay_board.jpg"/>

When you examine your relay board, you'll notice that the ones on the right are mounted 180&deg; from the ones on the left. As you'll see, I attached the white/black wires to the top two lugs on each relay on the left, and the bottom two lugs on the right relays. You could do that opposite (bottom two on left, top two on right) but you do need to wire them in opposites like this.

<img src="https://github.com/skypanther/clc/blob/master/images/whole_setup.jpg"/>

I mounted four double-gang boxes, to hold 8 outlets, into a small sheet of plywood. I broke the tabs between the top & bottom outlet in each so that I could wire up the 16 receptacles separately. You'll see I have them numbered 1-16 in the above. I have one additional outlet into which I can plug the Raspberry Pi and Sainsmart board (yeah, I know I could feed them both power off the same wallpack). 

I put the board into a plastic storage tub. I cut a flap in the side. All the outlets are wired up to short power cords that I plug into extension cords run across the yard to my garage. Those three cords, plus the 16 for the Christmas lights are fed through the flap in the side. This makes the setup pretty reasonably water/snow proof. Despite some howling winds and heavy snows, I had no water or snow get inside the box.

I found it helpful to put small tape flags on each of the jumper wires that ran from the Pi to the relay board. These I numbered with the outlet number. 

*References:*

* RPi pinout - http://pinout.xyz/ (*don't connect a relay to the TXD pin, e.g. pin 8 on the Pi B+, as it will be flashed on/off very rapidly when the Pi boots, which could burn out your relay*)
* I found it helpful to go through https://docs.google.com/document/d/1x97JIu5xVInZMutTNeaHlnQuyoLHjf3h-ugIo64pGfI/edit to set up and test my RPi. You could use it for off-season testing of your show, etc. 
* Sainsmart relay board manual (community contributed) http://www.homebrewtalk.com/showthread.php?t=523263 which says about the fastest you can switch the relays on/off is roughly once per second. However, I've seen 10 ms (1/100th of a second) referenced elsewhere. I would stick to slower than 100ms so you don't wear out the relays too quickly. 

## Usage

The following steps could be done on any computer, not necessarily on your Raspberry Pi light show controller. If you do this on your desktop, you will need to have done steps 1 & 2 of the Software Setup above.

* Generate a show: run `node generateshow.js` and follow the prompts.
* Create the lighting sequences: run `node sequencer.js` and follow the prompts.
* Test a show: run `node testshow.js` and follow the prompt
* Test each relay in sequence (e.g. to make sure you have things wired correctly): run `node testrelays.js`

However, you must run the show from the Raspberry Pi.

* On the Rasbperry Pi, make sure you've downloaded and installed this software package as described above
* If you created your sequence on a different computer, transfer the show file from the shows folder to your RPi's `~/clc/show` folder
* Then, in the project directory:
	* Run `node index.js` or `npm start` and you'll be prompted to choose the show to run. It will run until you stop it.
	* To start a specific show, add its name to the command, such as `node index.js myshow`
	* If starting a specific show, you can stop it after the specified hours, e.g. `node index.js myshow 3.5` to stop after three-and-a-half hours

You can automate running this every night by using cron. On your Pi, run `crontab -e` and choose your favorite editor (nano recommended). Add this to the bottom of the file:

```
# start the Christmas light show at 5:30 pm every day
30 17 * * * cd /home/pi/clc && /usr/local/bin/node index.js show1 5.5
```

Where the first two numbers represent 30 minutes past the hour of 17 (aka 5pm). At that point, the index.js file is run, starting a show called `show1` which will run for 5.5 hours. 



## 2016 Christmas Notes

2016 was my first year using the `clc` system. Overall, I'm very happy with the results. Well, except the Raspberry Pi would crash after a couple of hours. I've rewritten the `index.js` file since then on the theory that I had a slow memory leak that eventually caused the Pi to crash. Also, my show generation scripts proved to be rather unusable. I ended up generating a 15-min show file then hand-editing it. 