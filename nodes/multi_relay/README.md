# Mega Tree Node Controller

## Software Installation

On your Raspberry Pi:

1. Set up your Raspberry Pi and make sure it is up-to-date with `sudo apt-get update && sudo apt-get dist-upgrade`
2. Make sure you're running the latest version of Python with `sudo apt-get upgrade python3`
3. Install the required Python modules:
	* `sudo apt-get install python3-gpiozero python-gpiozero` 
4. Download this repo onto your Raspberry Pi
	* Preferred method: `git clone git@github.com:skypanther/PiLit.git`
	* Or, download the zip, extract to a folder in your home directory
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

<img src="https://github.com/skypanther/PiLit/blob/master/images/relay_board.jpg"/>

When you examine your relay board, you'll notice that the ones on the right are mounted 180&deg; from the ones on the left. As you'll see, I attached the white/black wires to the top two lugs on each relay on the left, and the bottom two lugs on the right relays. You could do that opposite (bottom two on left, top two on right) but you do need to wire them in opposites like this.

<img src="https://github.com/skypanther/PiLit/blob/master/images/whole_setup.jpg"/>

I mounted four double-gang boxes, to hold 8 outlets, into a small sheet of plywood. I broke the tabs between the top & bottom outlet in each so that I could wire up the 16 receptacles separately. You'll see I have them numbered 1-16 in the above. I have one additional outlet into which I can plug the Raspberry Pi and Sainsmart board (yeah, I know I could feed them both power off the same wallpack). 

I put the board into a plastic storage tub. I cut a flap in the side. All the outlets are wired up to short power cords that I plug into extension cords run across the yard to my garage. Those three cords, plus the 16 for the Christmas lights are fed through the flap in the side. This makes the setup pretty reasonably water/snow proof. Despite some howling winds and heavy snows, I had no water or snow get inside the box.

I found it helpful to put small tape flags on each of the jumper wires that ran from the Pi to the relay board. These I numbered with the outlet number. 

*References:*

* RPi pinout - http://pinout.xyz/ (*don't connect a relay to the TXD pin, e.g. pin 8 on the Pi B+, as it will be flashed on/off very rapidly when the Pi boots, which could burn out your relay*)
* I found it helpful to go through https://docs.google.com/document/d/1x97JIu5xVInZMutTNeaHlnQuyoLHjf3h-ugIo64pGfI/edit to set up and test my RPi. You could use it for off-season testing of your show, etc. 
* Sainsmart relay board manual (community contributed) http://www.homebrewtalk.com/showthread.php?t=523263 which says about the fastest you can switch the relays on/off is roughly once per second. However, I've seen 10 ms (1/100th of a second) referenced elsewhere. I would stick to slower than 100ms so you don't wear out the relays too quickly. 

# Running on boot

(for Raspberry Pi, tested on Raspbian Buster, but should work for other Raspbian versions)

To run the multi_relay.py script when your Pi boots:

1. Create a file in your home directory named boot_script.sh with these statements:

```
#!/bin/bash

source /home/pi/venv/bin/activate
cd /home/pi/PiLit/nodes/multi_relay
sleep 15
python3 multi_relay.py &
```

The 15 sec sleep command is required to give your Pi time to connect to your network. You may need to adjust that time for your network. If you're not using a virtual environment, don't include the `source` line. 


2. Mark the file as executable; at a terminal, enter:

```
chmod +x /home/pi/boot_script.sh
```

3. Modify your rc.local file, which will run this script at boot time:


```
sudo nano /etc/rc.local
```

And right before the `exit 0` line, add:

```
sudo bash -c "/home/pi/boot_script.sh > /home/pi/multi_relay.log 2>&1" &
```

4. Save the file and reboot. Wait 15 seconds after it finishes booting. Then, send an MQTT command to your multi_relay node and the relay should turn on. For example:

```
mosquitto_pub -h 192.168.1.18 -i publisher -t megatree -m 'on'
```

(where `192.168.1.18` is your MQTT server's IP address and `megatree` is the node's name)
