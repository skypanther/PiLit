# PiLit Player

The PiLit Player is, well, the player for your animation script. It is a Python app. I run it on a Raspberry Pi, though you should be able to run it on any computer with a Python environment (and network connectivity).

## Usage

You will need an MQTT broker (server) on your network. If you use a Raspberry Pi, install the Mosquitto broker:

```shell
sudo apt install mosquitto mosquitto-clients
```

Doing so will add the mosquitto broker service to your system so that it is running automatically for you. It will also install the tools you need to send MQTT messages from the command line (to test your nodes).

Using the show you created with PiLit GUI, then

```shell
pilit_player path/to/show.json
```

For example:

```shell
pilit_player /home/pi/ChristmasShow.json
```

# Running on boot

(for Raspberry Pi, tested on Raspbian Buster, but should work for other Raspbian versions)

To run the pilit script when your Pi boots:

1. Create a file in your home directory named boot_script.sh with these statements:

```
#!/bin/bash

source /home/pi/py3env/bin/activate
cd /home/pi/PiLit/pilit_player
sleep 15
python pilit_player.py /home/pi/ChristmasShow.json &
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
sudo bash -c "/home/pi/boot_script.sh" &
```

4. Save the file and reboot. If it is during the scheduled time that your show should run, after that 15 second delay in the boot script, your show should begin. It will run till the end time.