from utils.subclasses import EnumValueAliases


class DaysOfWeek(EnumValueAliases):
    ALL = "All"
    MON = "Monday"
    TUES = "Tuesday"
    WED = "Wednesday"
    THU = "Thursday"
    FRI = "Friday"
    SAT = "Saturday"
    SUN = "Sunday"


class ColorPalette(EnumValueAliases):
    # Represents the limited palette of colors supported by the RGB-type nodes
    # (pixel_node, sphero)
    # Listed here in roughly spectrum order w/white-black values first
    # value is "display_name", "value_expected_by_nodes"
    WHITE = "white", "white"
    SNOW = "snow", "snow"
    SILVER = "silver", "silver"
    GREY = "grey", "grey"
    DARKGREY = "dark grey", "darkgrey"
    BLACK = "black", "black"

    RED = "red", "red"
    CRIMSON = "crimson", "crimson"
    DARKMAGENTA = "dark magenta", "darkmagenta"
    DARKRED = "dark red", "darkred"
    MAGENTA = "magenta", "magenta"
    MAROON = "maroon", "maroon"

    ORANGE = "orange", "orange"
    ORANGERED = "orange-red", "orangered"
    DARKORANGE = "dark orange", "darkorange"

    YELLOW = "yellow", "yellow"
    GOLD = "gold", "gold"

    GREEN = "green", "green"
    LIME = "lime", "lime"
    DARKGREEN = "dark green", "darkgreen"
    FORESTGREEN = "forest-green", "forestgreen"

    CYAN = "cyan", "cyan"
    DARKCYAN = "dark cyan", "darkcyan"

    BLUE = "blue", "blue"
    DEEPSKYBLUE = "deep sky-blue", "deepskyblue"
    ROYALBLUE = "royal blue", "royalblue"
    SKYBLUE = "sky-blue", "skyblue"
    DARKBLUE = "dark blue", "darkblue"
    NAVY = "navy", "navy"

    BLUEVIOLET = "blue-violet", "blueviolet"
    PURPLE = "purple", "purple"
    VIOLET = "violet", "violet"
    INDIGO = "indigo", "indigo"
    DARKVIOLET = "dark violet", "darkviolet"
