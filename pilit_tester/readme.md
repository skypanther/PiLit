# PiLit Tester

Simple web app to send MQTT commands to your nodes for testing during setup.

I used to do this sort of testing manually with an SSH/terminal app on my phone. It's hard to type shell commands on a phone. Plus, the MQTT commands for the nodes are a bit arcane so I was forever messing them up and wondering why my node wasn't reacting.

## One-time setup

In a terminal window:

1. Enter `python3 -m venv venv`
2. Enter `source venv/bin/activate`
3. Enter `pip install requirements.txt`

## Configuring the nodes and animations

Configuration of your nodes and the animations they support are defined in the testing_animations.yaml file.

```yaml
# Configuration of nodes and the animations to choose from during testing

mqtt_server: northpole.local
mqtt_port: 1883
nodes:
  - name: Node 1 # name of your node
    mqtt_name: node_1_mqtt # mqtt/channel name of your node
    type: Pixel # type, not currently used
    animations:
      - name: "Turn Off" # a name you want to call it
        text: black:solid_color # the PiLit "message" string
      - name: Solid Red
        text: red:solid_color
      - name: Solid Blue
        text: blue:solid_color
      - name: Bounce Red
        text: red:bounce
  - name: Node 2
    mqtt_name: node_2_mqtt
    type: OnOff
    animations:
      - name: "Turn On"
        text: "on" # note: this must be in quotes or python will convert it to `true`
      - name: "Turn Off"
        text: "off" # note: this must be in quotes or python will convert it to `false`
```

## Running the server

1. Enter `source venv/bin/activate`
2. Enter `fastapi dev main.py`
3. Visit http://127.0.0.1:8000

You should now be able to access the PiLit Tester web page.

Note, this will work when accessing the PiLit Tester web page from the same computer. If you want to access from a different computer (or phone) on your network, you'll need to run `fastapi run main.py` (notice `run` instead of `dev`)
