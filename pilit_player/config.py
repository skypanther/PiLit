#
# Configuration should all be done in this file. You shouldn't
# need to touch the pilit_player.py file
#

# my server is named northpole, change this; IP addresses work too
mqtt_server = "northpole.local"

# This interval defines how often new animation commands are sent to
# the nodes. One-half second is a balance between frequency and load
# on your player computer. Feel free to adjust but don't go crazy short.
show_loop_interval = 0.5  # seconds

# Turns on/off logging to the stdout console
logging_enabled = True


# Logging function
def log(msg):
    if logging_enabled:
        print(msg)
