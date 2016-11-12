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
* Raspberry Pi set up according to the Hardware Setup section

## Software Installation

1. Download this repo
2. Run `npm install`

## Usage

The following steps could be done on any computer, not necessarily on your Raspberry Pi light show controller.

* Generate a show: run `node generateshow.js` and follow the prompts.
* Create the lighting sequences: run `node sequencer.js` and follow the prompts.
* Test a show: run `node tester.js` and follow the prompt

However, you must run the show from the Raspberry Pi.

* On the Rasbperry Pi, make sure you've downloaded and installed this software package as described above
* If you created your sequence on a different computer, transfer the show file from the shows folder to your RPi's show folder
* Then, in the project directory run `node index.js` or `npm start`

You can automate running this every night by using cron. (instructions to follow)

## Hardware setup

Sainsmart relay board manual (community contributed) http://www.homebrewtalk.com/showthread.php?t=523263

Per that doc, you can expect to switch the relays on/off roughly once per second at a max because of their mechanical nature.

(notes/instructions to follow)