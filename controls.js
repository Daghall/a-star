import PathFinder from "./path-finder.js";
import {values} from "./constants.js";
const {UNPASSABLE} = values;

export default class Controls {
  constructor(gui, canvasElement) {
    const {gridSize} = gui.properties;
    this.gui = gui;
    this.drawBlocks = true;
    this.options = {
      showCosts: false,
      livePathing: true,
      wayPoints: true,
      animate: false,
    };
    this.map = gui.map;
    this.canvasElement = canvasElement;
    this.gridSize = gridSize;
    this.mouseDown = false;
    this.pathFinder = new PathFinder(gui.map, () => {
      this.draw();
    });
    this.randomize();
    this.pathFinder.begin(this.map.start, this.map.end);
    this.draw();
    this.displayOptions();

    this.setupEventListeners();
  }

  async setTarget(x, y, event) {
    const square = this.map.getSquare(x, y);
    if (square === UNPASSABLE) return;
    this.end = {x, y};
    this.map.setTarget(this.end);
    this.targetMode = event.type === "mousemove" ? true : false;
    await this.restartPathFinder({end: this.end});
    this.draw();
  }

  async setStart(x, y) {
    const square = this.map.getSquare(x, y);
    if (square === UNPASSABLE) return;

    this.start = {x, y};
    this.map.setStart(this.start);
    this.startMode = event.type === "mousemove" ? true : false;
    await this.restartPathFinder({start: this.start});
    this.draw();
  }

  async restartPathFinder(options) {
    try {
      await this.pathFinder.restart(options);
    } catch (e) {
      // NO-OP
    }
  }

  randomize() {
    this.start = {
      x: this.randomRow(),
      y: this.randomCol(),
    };
    this.end = {
      x: this.randomRow(),
      y: this.randomCol(),
    };
    this.map.setStart(this.start);
    this.map.setTarget(this.end);
  }

  setupEventListeners() {
    window.addEventListener("keydown", async (event) => {
      this.startMode = false;
      this.targetMode = false;
      switch (event.key) {
        case " ":
          this.pathFinder.stepExecution = true;
          event.preventDefault();
          if (this.pathFinder.potential.size === 0) {
            this.pathFinder.begin(this.start, this.end);
            this.draw();
          } else {
            this.pathFinder.iterate();
            this.draw();
          }
          break;
        case "b":
          this.drawBlocks = !this.drawBlocks;
          break;
        case "c":
          this.options.showCosts = !this.options.showCosts;
          this.options.wayPoints = false;
          this.draw();
          break;
        case "r":
          this.pathFinder.reset();
          this.gui.reset();
          this.gui.draw();
          this.options.animate = false;
          this.options.livePathing = false;
          break;
        case "s":
          this.startMode = true;
          this.targetMode = false;
          break;
        case "e":
          this.startMode = false;
          this.targetMode = true;
          break;
        case "w":
          this.options.wayPoints = !this.options.wayPoints;
          if (this.options.wayPoints) {
            this.options.animate = false;
          }
          this.draw();
          break;
        case "l":
          this.options.livePathing = !this.options.livePathing;
          if (this.options.livePathing) {
            this.options.animate = false;
            this.pathFinder.stepExecution = false;
            this.pathFinder.reset();
            this.pathFinder.begin(this.map.start, this.map.end);
            this.draw();
          } else {
            this.startMode = false;
            this.targetMode = false;
          }
          break;
        case "a":
          this.options.animate = !this.options.animate || !!this.pathFinder.path;
          this.displayOptions();
          this.pathFinder.stepExecution = this.options.animate;
          try {
            if (this.options.animate) {
              if (this.pathFinder.path) {
                this.pathFinder.restart();
              }
              this.options.livePathing = false;
              this.options.wayPoints = false;
              if (this.pathFinder.potential.size === 0) {
                this.pathFinder.begin(this.map.start, this.map.end);
                this.pathFinder.restart();
              }
            }

            while (this.options.animate && !this.pathFinder.path) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              this.pathFinder.iterate();
            }
          } catch (e) {
            // NO-OP
          }
          break;
      }
      this.displayOptions();
    });

    document.addEventListener("mousedown", (event) => {
      if (event.target !== this.canvasElement) return;
      this.mouseDown = true;
      if (!this.options.livePathing) {
        this.pathFinder.reset();
        this.options.animate = false;
      }
      if (this.mouseDown && event.target === this.canvasElement) {
        this.lastClicked = this.click(event);
      }
    });

    document.addEventListener("mouseup", () => {
      this.mouseDown = false;
      this.displayOptions();
    });

    document.addEventListener("mousemove", (event) => {
      if (event.target !== this.canvasElement) return;

      if (this.mouseDown) {
        const {row, col} = this.getCoords(event);
        const gridSquare = this.gui.map.getSquare(row, col);
        if (typeof this.lastClicked === "number" && this.lastClicked !== gridSquare) {
          this.click(event);
        }
      } else if (this.options.livePathing) {
        const {row, col} = this.getCoords(event);
        if (this.targetMode) {
          this.setTarget(row, col, event);
        } else if (this.startMode) {
          this.setStart(row, col, event);
        }
      }
    });
  }

  getCoords({offsetX, offsetY}) {
    const row = Math.floor(offsetY / this.gridSize);
    const col = Math.floor(offsetX / this.gridSize);
    return {row, col};
  }

  click(event) {
    const {row, col} = this.getCoords(event);

    if (this.targetMode) {
      this.setTarget(row, col, event);
      return;
    }

    if (this.startMode) {
      this.setStart(row, col, event);
      return;
    }

    if (this.drawBlocks) {
      this.gui.map.toggle(row, col);
    }

    this.draw();
    return this.gui.map.getSquare(row, col);
  }

  async draw() {
    if (this.options.livePathing) {
      await this.restartPathFinder();
    }
    this.gui.draw(this.pathFinder);
  }

  displayOptions() {
    window.options.innerText = `${JSON.stringify(this.options, null, 2)}\n\n\n`;
  }

  random(max) {
    return Math.floor(Math.random() * max);
  }
  randomCol() {
    return this.random(this.map.cols);
  }
  randomRow() {
    return this.random(this.map.rows);
  }
}
