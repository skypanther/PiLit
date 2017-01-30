# Christmas Lights Controller

RaspberryPi based Christmas lights controller system using a Sainsmart 16-channel relay board.

Very much a work-in-progress. Even when "done" this will be hacker's tool, not some slick GUI-based app.

## Design goals

My goal for this project was to create a super-simple lightshow controller that didn't cost me a thousand dollars. I found a cheap relay board (link to follow) and with a bunch of digging instructions on how to use a Raspberry Pi to control it. 

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
* Raspberry Pi, relay board, and outlets set up according to the Hardware Setup section

## Software Installation

On your Raspberry Pi:

1. Download this repo --
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

(For more info on the preceding two steps, see https://www.npmjs.com/package/rpio)

## Usage

The following steps could be done on any computer, not necessarily on your Raspberry Pi light show controller.

* Generate a show: run `node generateshow.js` and follow the prompts.
* Create the lighting sequences: run `node sequencer.js` and follow the prompts.
* Test a show: run `node testshow.js` and follow the prompt
* Test each relay in sequence (e.g. to make sure you have things wired correctly): run `node testrelays.js`

However, you must run the show from the Raspberry Pi.

* On the Rasbperry Pi, make sure you've downloaded and installed this software package as described above
* If you created your sequence on a different computer, transfer the show file from the shows folder to your RPi's show folder
* Then, in the project directory run `node index.js` or `npm start`
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

* RPi pinout - http://pinout.xyz/
* I found it helpful to go through https://docs.google.com/document/d/1x97JIu5xVInZMutTNeaHlnQuyoLHjf3h-ugIo64pGfI/edit to set up and test my RPi. You could use it for off-season testing of your show, etc. 
* Sainsmart relay board manual (community contributed) http://www.homebrewtalk.com/showthread.php?t=523263 which says about the fastest you can switch the relays on/off is roughly once per second. However, I've seen 10 ms (1/100th of a second) referenced elsewhere. I would stick to slower than 100ms so you don't wear out the relays too quickly. 


(notes/instructions to follow)