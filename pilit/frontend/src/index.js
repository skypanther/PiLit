/*
PiLit GUI - a web tool for creating PiLit light show sequences

(c) 2019 Tim Poulsen
MIT License
*/

import React from "react";
import { createRoot } from "react-dom/client";
import App from "App";

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
