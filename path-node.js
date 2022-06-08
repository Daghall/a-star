// G cost = Distance from start
// H cost = Distance from end (heuristic)
// F cost = Sum och G and H

import {values} from "./constants.js";
const {
  DIAGONAL_COST,
  RIGHT_ANGLE_COST,
  UNPASSABLE,
} = values;

export default class PathNode {
  constructor(x, y, start, end, pathFinder, previousNode) {
    this.x = x;
    this.y = y;
    this.traversed = false;
    this.previousNode = previousNode;
    this.gCost = 0;
    this.pathFinder = pathFinder;
    this.start = start;
    this.end = end;
    this.calculate(start, end);
    this.areWeThereYet();
  }

  calculateCost(square) {
    const xDiff = Math.abs(square.x - this.x);
    const yDiff = Math.abs(square.y - this.y);
    const max = Math.max(xDiff, yDiff);
    const min = Math.min(xDiff, yDiff);
    return (max - min) * RIGHT_ANGLE_COST + min * DIAGONAL_COST;
  }

  calculate(start, end) {
    if (this.previousNode) {
      this.gCost = this.moving();
    }
    this.hCost = this.calculateCost(end);
    this.fCost = this.gCost + this.hCost;
  }

  moving() {
    const diagonalMove = this.x !== this.previousNode.x && this.y !== this.previousNode.y;
    return this.previousNode.gCost + (diagonalMove ? DIAGONAL_COST : RIGHT_ANGLE_COST);
  }

  explore() {
    this.traversed = true;
    for (let x = -1; x <= 1; ++x) {
      for (let y = -1; y <= 1; ++y) {
        if ((x | y) === 0) continue;
        const currentRow = this.x + x;
        const currentCol = this.y + y;
        if (this.pathFinder.map.getSquare(currentRow, currentCol) === UNPASSABLE) continue;
        const currentSquare = this.pathFinder.find(currentRow, currentCol);
        if (currentSquare?.traversed) continue;
        const newPathNode = new PathNode(currentRow, currentCol, this.start, this.end, this.pathFinder, this);
        if (!currentSquare || newPathNode.gCost < currentSquare.gCost) {
          if (currentSquare) {
            this.pathFinder.replace(newPathNode);
          } else {
            this.pathFinder.potential.add(newPathNode);
          }
        }
      }
    }
  }

  areWeThereYet() {
    if (this.hCost === 0) {
      this.pathFinder.targetFound(this);
    }
  }
}
