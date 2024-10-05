from pydantic import BaseModel, Json


class NodeDetails(BaseModel):
    mqtt_name: str
    animation: str
