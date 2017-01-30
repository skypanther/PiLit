# Christmas Lights Controller

RaspberryPi based Christmas lights controller system using a Sainsmart 16-channel relay board.

Very much a work-in-progress. Even when "done" this will be hacker's tool, not some slick GUI-based app.

## Design goals

My goal for this project was to create a super-simple lightshow controller that didn't cost me a thousand dollars. I found a cheap  [Sainsmart 16-channel](https://www.amazon.com/SainSmart-101-70-103-16-Channel-Relay-Module/dp/B0057OC66U/ref=sr_1_3?ie=UTF8&qid=1485741648&sr=8-3&keywords=sainsmart+relay) relay board and with a bunch of digging instructions on how to use a Raspberry Pi to control it. 

I found a couple of software projects for controlling such a system. However, none of them did exactly what I wanted. Specifically, I didn't care if the lights were timed to music. But, I did want to program sequences for specific sets of lights. For example, I have a row of trees I wanted to light in sequence, flash together, etc.

With that in mind, I decided to write something on my own. 

Goals:

* Run on a Raspberry Pi
* Let me define the lighting sequences myself
* Get this done quickly and be ready for the current Christmas season (I started in mid-October)

Things that are not goals:

* Syncing the show to music
* Having a slick GUI app to create the shows
* Control the relay / lights from a PC or Mac computer

So, really, in summary this is quick-n-dirty code and not really architected at all. Thar be dragons...

## Requirements

* NodeJS
* Raspberry Pi with a wireless adapter; you'll want one with as many GPIO pins as 
* A relay board like listed above
* A bunch of outlets, electrical boxes, wire, connectors, etc.

## Software Installation

On your Raspberry Pi:

1. Download this repo onto your Raspberry Pi
	2. Preferred method: `git clone git@github.com:skypanther/clc.git`
	3. Or, download the zip, extract to a clc folder in your home directory
2. Change to the clc directory and run `npm install`
3. Add the pi user to the gpio group: `sudo usermod -a -G gpio pi`
4. Run the following command to configure udev: 
	
	```shell
	$ sudo cat >/etc/udev/rules.d/20-gpiomem.rules <<EOF
	SUBSYSTEM=="bcm2835-gpiomem", KERNEL=="gpiomem", GROUP="gpio", MODE="0660"
	EOF
	```
5. Once you have wired up your relay, uppdate the `var pins=[...` line in the index.js file. Make sure the pin numbers there correspond to the GPIO pins you used, in the order you used them.

(For more info on those last two steps, see https://www.npmjs.com/package/rpio)

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

## Hardware setup


*References:*

* RPi pinout - http://pinout.xyz/ (*don't connect a relay to the TXD pin, e.g. pin 8 on the Pi2, as it will be flashed on/off very rapidly when the Pi boots, which could burn out your relay*)
* I found it helpful to go through https://docs.google.com/document/d/1x97JIu5xVInZMutTNeaHlnQuyoLHjf3h-ugIo64pGfI/edit to set up and test my RPi. You could use it for off-season testing of your show, etc. 
* Sainsmart relay board manual (community contributed) http://www.homebrewtalk.com/showthread.php?t=523263 which says about the fastest you can switch the relays on/off is roughly once per second. However, I've seen 10 ms (1/100th of a second) referenced elsewhere. I would stick to slower than 100ms so you don't wear out the relays too quickly. 

<img src="https://github.com/skypanther/clc/blob/master/images/relay_board.jpg"/>

When you examine your relay board, you'll notice that the ones on the right are mounted 180&deg; from the ones on the left. As you'll see, I attached the white/black wires to the top two lugs on each relay on the left, and the bottom two lugs on the right relays. You could do that opposite (bottom two on left, top two on right) but you do need to wire them in opposites like this.

<img src="https://github.com/skypanther/clc/blob/master/images/whole_setup.jpg"/>

I mounted four double-gang boxes, to hold 8 outlets, into a small sheet of plywood. I broke the tabs between the top & bottom outlet in each so that I could wire up 16 outlets separately. You'll see I have them numbered 1-16 in the above. I have one additional outlet into which I can plug the Raspberry Pi and Sainsmart board (yeah, I know I could feed them both power off the same wallpack). 

I put the board into a plastic storage tub. I cut a flap in the side. All the outlets are wired up to show power cords that I plug into extension cords run across the yard to my garage. Those three cords, plus the 16 for the Christmas lights are fed through the flap in the side. This makes the setup pretty reasonably water/snow proof. Despite some howling winds and heavy snows, I had no water or snow get inside the box.

## 2016 Christmas Notes

2016 was my first year using the `clc` system. Overall, I'm very happy with the results. Well, except the Raspberry Pi would crash after a couple of hours. I've rewritten the `index.js` file since then on the theory that I had a slow memory leak that eventually caused the Pi to crash. Also, my show generation scripts proved to be rather unusable. I ended up generating a 15-min show file thenb hand-editing it. 