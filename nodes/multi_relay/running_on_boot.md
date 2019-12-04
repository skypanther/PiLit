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

The 15 sec sleep command is required to give your Pi time to connect to your network. You may need to adjust that time for your network.


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
