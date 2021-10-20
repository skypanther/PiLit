module.exports = {
  mode: "jit",
  purge: {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [/data-theme$/],
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      // See https://daisyui.com/core/colors to create custom theme
      "pastel", // first one will be the default theme
      "bumblebee",
      "synthwave",
      "emerald",
      "forest",
      "dark",
    ],
  },
};
