import json
import paho.mqtt.publish as publish
import pathlib
import yaml

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

from models import NodeDetails

app = FastAPI()
BASE_DIR = pathlib.Path(__file__).parent
templates = Jinja2Templates(
    directory=[
        BASE_DIR / "templates",
    ]
)

with open("testing_animations.yaml") as stream:
    try:
        config = yaml.safe_load(stream)
        mqtt_server = config["mqtt_server"]
        mqtt_port = config["mqtt_port"]
        nodes = config["nodes"]
    except yaml.YAMLError as exc:
        print(exc)


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    context = {"request": request, "nodes": nodes, "title": "PiLit Tester"}
    response = templates.TemplateResponse("index.html", context)
    return response


@app.get("/get_animations/{mqtt_name}")
async def index(request: Request, mqtt_name):
    for node in nodes:
        if node["mqtt_name"] == mqtt_name:
            node_animations = node["animations"]
    if not node_animations:
        raise
    return json.dumps(node_animations, indent=4, default=str)


# /{mqtt_name}/{mqtt_command}
@app.post("/", response_class=HTMLResponse)
async def index_post(request: Request):
    if request.headers["Content-Type"] == "application/json":
        item = NodeDetails(**await request.json())
    elif request.headers["Content-Type"] == "multipart/form-data":
        item = NodeDetails(**await request.form())
    elif request.headers["Content-Type"] == "application/x-www-form-urlencoded":
        item = NodeDetails(**await request.form())
    send_command(item.mqtt_name, item.animation)

    # return the index page again
    context = {"request": request, "nodes": nodes, "title": "PiLit Tester"}
    response = templates.TemplateResponse("index.html", context)
    return response


def send_command(topic, payload):
    # paho mqtt send command here
    if "shelly" in topic:
        """ Hack method to determine if the node is a Shelly on/off node.
        Such nodes need "/rpc" appended to their name. But I can't include
        that in the YAML file because the name is used to build a URL and
        the /rpc gets interpreted as part of the path. All the Shellies
        I've tested include "shelly" at the beginning of their name, thus
        the string search & append operation here.
        """
        topic = f"{topic}/rpc"
    print(f"mosquitto_pub -h {mqtt_server} -i publisher -t {topic} -m '{payload}'")
    publish.single(topic, payload=payload, hostname=mqtt_server)
