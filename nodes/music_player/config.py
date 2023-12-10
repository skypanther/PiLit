######## MQTT/NETWORK CONFIGURATION ########
from typing import List

base_path = "/user/pi/pilit_audio/"


class MqttConfig:
    server_name: str = "northpole.local"  # IP address or name of the broker (server)
    client_name: str = "musicplayer"  # This node's name, doesn't have to match hostname
    topics: List[str] = ["all", "musicplayer"]
