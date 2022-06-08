import {values} from "./constants.js";
const {UNPASSABLE} = values;

export default class Map {
  constructor(gui) {
    const {canvasHeight, canvasWidth, gridSize} = gui.properties;
    this.map = [];
    this.rows = Math.floor(canvasHeight / gridSize);
    this.cols = Math.floor(canvasWidth / gridSize);

    for (let row = 0; row < this.rows; ++row) {
      this.map[row] = [];
      for (let col = 0; col < this.cols; ++col) {
        this.map[row][col] = 0;
      }
    }
  }

  getGrid() {
    return this.map;
  }

  getSquare(row, col) {
    if (row < 0 || row > this.rows - 1) return UNPASSABLE;
    if (col < 0 || col > this.cols - 1) return UNPASSABLE;
    return this.map[row][col];
  }

  setTarget(coords) {
    this.end = coords;
  }

  setStart(coords) {
    this.start = coords;
  }

  toggle(row, col) {
    this.map[row][col] ^= UNPASSABLE;
  }
}

