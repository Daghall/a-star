import {colors, fonts} from "./constants.js";

export default class Drawer {
  constructor(gui) {
    this.gui = gui;
    this.gridSize = this.gui.properties.gridSize;
    this.canvas = this.gui.canvas;
    this.canvas.lineWidth = 1;
    this.canvas.strokeStyle = colors.default;
    this.canvas.fillStyle = colors.default;
  }

  draw(pathFinder) {
    this.pathFinder = pathFinder;

    if (!this.gui.controls.options.wayPoints) {
      this.drawAlgorithm();
      this.drawAlgorithmPath();
    } else {
      this.drawWayPoints();
    }

    this.drawGrid();

    this.drawPoi(this.gui.map.start, "🏃"); //
    this.drawPoi(this.gui.map.end, "🏁");
    if (this.pathFinder?.failed) {
      this.drawFail();
    }
  }

  drawAlgorithm() {
    if (this.pathFinder) {
      this.pathFinder.getAllNodes().forEach((item) => {
        const {traversed} = item;
        const x = this.gridSize * item.y + 1;
        const y = this.gridSize * item.x + 1;
        this.canvas.beginPath();
        this.canvas.rect(x, y, this.gridSize, this.gridSize);
        this.canvas.fillStyle = traversed ? colors.traversed : colors.prospect;
        this.canvas.fill();

        if (this.gui.controls.options.showCosts) {
          this.drawCosts(x, y, item);
        }
      });
    }
  }

  drawAlgorithmPath() {
    if (this.pathFinder?.path) {
      let current = this.pathFinder.path;
      while (current) {
        const x = this.gridSize * current.y + 1;
        const y = this.gridSize * current.x + 1;
        this.canvas.beginPath();
        this.canvas.rect(x, y, this.gridSize - 1, this.gridSize - 1);
        this.canvas.fillStyle = colors.path;
        this.canvas.fill();

        if (this.gui.controls.options.showCosts) {
          this.drawCosts(x, y, current);
        }

        current = current.previousNode;
      }
    }
  }

  drawWayPoints() {
    if (this.pathFinder?.path) {
      let current = this.pathFinder.path;
      this.canvas.strokeStyle = colors.path;
      this.canvas.beginPath();

      while (current) {
        const x = this.gridSize * (current.y + 1 / 2);
        const y = this.gridSize * (current.x + 1 / 2);
        this.canvas.lineTo(x, y);

        current = current.previousNode;
      }
      this.canvas.stroke();
    }
  }

  drawGrid() {
    this.canvas.strokeStyle = colors.default;
    this.gui.map.getGrid().forEach((row, i) => {
      const y = this.gridSize * i + 1;
      row.forEach((col, j) => {
        this.canvas.beginPath();
        const x = this.gridSize * j + 1;
        this.canvas.moveTo(j * this.gridSize, 0);
        this.canvas.rect(x, y, this.gridSize, this.gridSize);

        this.canvas.fillStyle = colors.default;
        const gridValue = this.gui.map.getSquare(i, j);
        switch (gridValue) {
          case 1:
            this.canvas.fill();
            break;
        }
        this.canvas.stroke();
      });
    });
  }

  drawFail() {
    const y = (this.gui.map.end.x + 5 / 5) * this.gridSize;
    const x = (this.gui.map.end.y + 1 / 2) * this.gridSize;
    this.canvas.beginPath();
    this.canvas.font = fonts.fail;
    this.canvas.fillText("❌", x, y);
  }

  drawCosts(x, y, {gCost, hCost, fCost}) {
    this.canvas.fillStyle = colors.default;
    if (gCost > 0 & hCost > 0) {
      this.canvas.font = fonts.cost.large;
      this.canvas.fillText(fCost, x + this.gridSize / 2, y + this.gridSize / 5 * 4);
    }

    this.canvas.font = fonts.cost.small;
    this.canvas.fillText(gCost, x + this.gridSize / 4, y + this.gridSize / 4);
    this.canvas.fillText(hCost, x + this.gridSize / 4 * 3, y + this.gridSize / 4);
  }

  drawPoi(node, value) {
    const y = this.gridSize * (node.x + 1 / 7);
    const x = this.gridSize * (node.y + 1 / 15);

    this.canvas.font = fonts.poi;
    this.canvas.fillText(value, x + this.gridSize / 2, y + this.gridSize / 3 * 2);
    this.canvas.fillStyle = colors.default;
  }
}
