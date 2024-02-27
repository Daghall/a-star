import {colors} from "./constants.js";
import Controls from "./controls.js";
import Drawer from "./drawer.js";
import Map from "./map.js";

class Gui {
  constructor(type) {
    const canvasElement = document.querySelector("canvas");
    const canvasWidth = canvasElement.getAttribute("width");
    const canvasHeight = canvasElement.getAttribute("height");
    const gridSize = 40;
    this.type = type;
    this.properties = {
      canvasWidth,
      canvasHeight,
      gridSize,
      origin,
    };

    this.map = new Map(this);

    this.canvas = canvasElement.getContext("2d");
    this.canvas.textAlign = "center";

    this.controls = new Controls(this, canvasElement, this.properties);
    this.drawer = new Drawer(this);
  }

  draw(pathFinder) {
    this.reset();

    this.drawer.draw(pathFinder);
  }

  reset() {
    this.canvas.fillStyle = colors.backgound;
    this.canvas.fillRect(0, 0, this.properties.canvasWidth, this.properties.canvasHeight);
  }
}

function init() {
  const type = window.location.hash.slice(1) || "square";
  const gui = new Gui(type);
  gui.draw();
}

init();
