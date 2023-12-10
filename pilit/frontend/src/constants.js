import chroma from "chroma-js";

export const nodeTypes = [
  { label: "Audio Channel", value: "AudioNode" },
  { label: "RGB Pixel Node", value: "PixelNode" },
  { label: "RGB Pixel Tree", value: "PixelTree" },
  { label: "On / Off (spotlight) Node", value: "OnOffNode" },
  { label: "Mega Tree (multi-relay)", value: "MultiRelayNode" },
  { label: "Sphero Pixel Node", value: "SpheroNode" },
  { label: "Movin Max", value: "MovinMax" },
];

export const colors = [
  { label: "Black / Off", value: "black" },
  { label: "White", value: "white" },
  { label: "Snow", value: "snow" },
  { label: "Silver", value: "silver" },
  { label: "Gray", value: "gray" },
  { label: "Dark Gray", value: "darkgray" },
  { label: "Red", value: "red" },
  { label: "Crimson", value: "crimson" },
  { label: "Dark Magenta", value: "darkmagenta" },
  { label: "Dark Red", value: "darkred" },
  { label: "Magenta", value: "magenta" },
  { label: "Maroon", value: "maroon" },
  { label: "Orange", value: "orange" },
  { label: "Orange Red", value: "orangered" },
  { label: "Dark Orange", value: "darkorange" },
  { label: "Yellow", value: "yellow" },
  { label: "Gold", value: "gold" },
  { label: "Green", value: "green" },
  { label: "Lime", value: "lime" },
  { label: "Dark Green", value: "darkgreen" },
  { label: "Forest Green", value: "forestgreen" },
  { label: "Cyan", value: "cyan" },
  { label: "Dark Cyan", value: "darkcyan" },
  { label: "Blue", value: "blue" },
  { label: "Deep Sky Blue", value: "deepskyblue" },
  { label: "Royal Blue", value: "royalblue" },
  { label: "Sky Blue", value: "skyblue" },
  { label: "Dark Blue", value: "darkblue" },
  { label: "Navy", value: "navy" },
  { label: "Blue Violet", value: "blueviolet" },
  { label: "Purple", value: "purple" },
  { label: "Violet", value: "violet" },
  { label: "Indigo", value: "indigo" },
  { label: "Dark Violet", value: "darkviolet" },
];

const dot = (color = "#ccc") => ({
  alignItems: "center",
  display: "flex",

  ":before": {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: "block",
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

export const colorStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    fontSize: "8pt",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.value);
    return {
      ...styles,
      fontSize: "8pt",
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.value
        : isFocused
        ? chroma.contrast(color, "white") > 2
          ? color.alpha(0.1).css()
          : "#ccc"
        : null,
      color: isDisabled
        ? "#ccc"
        : isSelected
        ? chroma.contrast(color, "white") > 2
          ? "white"
          : "black"
        : chroma.contrast(color, "white") > 2
        ? data.value
        : "black",
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor:
          !isDisabled && (isSelected ? data.value : color.alpha(0.3).css()),
      },
    };
  },
  input: (styles) => ({ ...styles, ...dot() }),
  placeholder: (styles) => ({ ...styles, ...dot() }),
  singleValue: (styles, { data }) => ({ ...styles, ...dot(data.value) }),
};

export const animationStyles = {
  control: (styles) => ({ ...styles, fontSize: "8pt" }),
  option: (styles) => ({ ...styles, fontSize: "8pt", padding: "4pt" }),
};

export const animations = [
  {
    label: "Solid color",
    value: "solid_color",
    description: "Turn all LEDs to a single color",
  },
  {
    label: "Center-outwards",
    value: "center_out",
    description:
      "LEDs light up, one-by-one, from the center towards the end till the whole strip is on",
  },
  {
    label: "Edges-inward",
    value: "edges_in",
    description:
      "LEDs light up, one-by-one, from two ends towards the center till the whole strip is on",
  },
  {
    label: "Slinky",
    value: "slinky",
    description:
      "LEDs light up, one-by-one, starting from end closest to the microcontroller towards the other end till the whole strip is on",
  },
  {
    label: "Slinky backwards",
    value: "slinky_backwards",
    description:
      "LEDs light up, one-by-one, starting from end furthest from the microcontroller towards the other end till the whole strip is on",
  },
  {
    label: "Bounce",
    value: "bounce",
    description:
      "3 LEDs light up, then move as a group to the other end with the rest of the LEDs all off. Once they reach the far end, they move back towards the beginning.",
  },
  {
    label: "Bounce backwards",
    value: "bounce_backwards",
    description: "Same as bounce, starting from opposite end.",
  },
  {
    label: "Circle",
    value: "circle",
    description:
      "3 LEDs light up, then move as a group to the other end with the rest of the LEDs all off. Once they reach the far end, they start over from the original end.",
  },
  {
    label: "Circle backwards",
    value: "circle_backwards",
    description: "Same as circle, starting from the opposite end.",
  },
  {
    label: "Flash",
    value: "flash",
    description:
      "Whole strip lights up at full brightness, then fades to black.",
  },
  {
    label: "Rainbow",
    value: "rainbow",
    description:
      "A moving, blended (continuous) rainbow pattern fills the entire strip.",
  },
  {
    label: "Rainbow stripes",
    value: "rainbow_stripes",
    description:
      "Like rainbow, but with discrete stripes of rainbow colors separated by black.",
  },
  {
    label: "Ocean",
    value: "ocean",
    description:
      "A moving, blended (continuous) pattern of blues, greens, and white fills the entire strip.",
  },
  {
    label: "Stripes on black",
    value: "stripes",
    description:
      "Multiple discrete stripes of a single color travel down the strip with black between.",
  },
  {
    label: "Stripes on white",
    value: "stripes_white",
    description:
      "Multiple discrete stripes of a single color travel down the strip with white between.",
  },
];

export const spheroAnimations = [
  {
    label: "Spin 1 spoke",
    value: "spin_1",
    description: "Light up one spoke in sequence",
  },
  {
    label: "Spin 1 spoke backwards",
    value: "spin_1_backwards",
    description: "Like spin 1, but backwards",
  },
  {
    label: "Spin 2 spoke",
    value: "spin_2",
    description: "Light up two opposite in sequence",
  },
  {
    label: "Spin 2 spoke backwards",
    value: "spin_2_backwards",
    description: "Like spin 2, but backwards",
  },
  {
    label: "Hemisphere spin",
    value: "hemi_spin",
    description: "Lights half the sphere (3 spokes) in sequence",
  },
  {
    label: "Hemisphere spin backwards",
    value: "hemi_spin_backwards",
    description: "Like hemi spin, but backwards",
  },
  ...animations,
];
