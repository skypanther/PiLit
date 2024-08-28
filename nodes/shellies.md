export MQTT_SERVER="northpole.local"
export MQTT_PORT=1883
export SHELLY_ID="shelly1minig3-dcda0ce69534"

# Subscribe in another terminal so you can get errors and other messages

mosquitto_sub -h ${MQTT_SERVER} -p ${MQTT_PORT} -t mynewtopic/rpc

# or to all topics

mosquitto_sub -h ${MQTT_SERVER} -p ${MQTT_PORT} -t '#' -v

# get status info

mosquitto_pub -h ${MQTT_SERVER} -p ${MQTT_PORT} -t ${SHELLY_ID}/rpc \
 -m '{"id":"Shelly.GetStatus", "src":"devices/'${SHELLY_ID}'/messages/events", "method":"Shelly.GetStatus"}'

# then, turn on

mosquitto_pub -h ${MQTT_SERVER} -p ${MQTT_PORT} -t ${SHELLY_ID}/rpc -m '{"method": "Switch.Set", "params":{"id":0,"on":true}}'

# or turn off the Shelly

mosquitto_pub -h ${MQTT_SERVER} -p ${MQTT_PORT} -t ${SHELLY_ID}/rpc -m '{"method": "Switch.Set", "params":{"id":0,"on":false}}'

# via HTTP

http://192.168.0.122/relay/0?turn=on
http://192.168.0.122/relay/0?turn=off

# resources

https://shelly.guide/webhooks-https-requests/
https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Mqtt
https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen3#Shelly1MiniGen3-Basicwiringdiagrams
