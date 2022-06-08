import PathNode from "./path-node.js";
import NodeMap from "./node-map.js";

export default class PathFinder {
  constructor(map, callback) {
    this.potential = new NodeMap();
    this.traversed = new NodeMap();
    this.path = null;
    this.map = map;
    this.callback = callback;
  }

  async begin(start, end) {
    this.failed = false;
    const {x, y} = start;
    this.start = start;
    this.end = end;
    const startNode = new PathNode(x, y, this.start, this.end, this);
    this.potential.add(startNode);
    this.explore(startNode);
    if (!this.stepExecution) {
      while (!this.path) {
        this.iterate();
        if (this.steps > 1000) throw new Error("Spinning out of control");
      }
    }
  }

  iterate() {
    if (this.path || this.potential.size === 0) return;
    ++this.steps;
    // console.log({pot: this.potential.size, tra: this.traversed.size}); // eslint-disable-line no-console

    try {
      const next = this.potential.toArray()
        .reduce((prev, cur) => {
          if (!prev) return cur;
          if (cur.fCost === prev.fCost) {
            if (cur.hCost < prev.hCost) {
              return cur;
            }
          } else if (cur.fCost <= prev.fCost) {
            return cur;

          }
          return prev;

        });

      this.explore(next);

      if (this.stepExecution) {
        this.callback();
      }
    } catch (error) {
      this.failed = true;
      throw error;
    }
  }

  explore(node) {
    this.potential.remove(node);
    this.traversed.add(node);
    node.explore();
  }

  getAllNodes() {
    return [...this.potential.toArray(), ...this.traversed.toArray()];
  }

  async restart({start, end} = {}) {
    this.reset();
    if (start) {
      this.start = start;
    }
    if (end) {
      this.end = end;
    }
    await this.begin(this.start, this.end);
  }

  find(x, y) {
    return this.potential.get(x, y) || this.traversed.get(x, y);
  }

  replace(replacement) {
    this.potential.replace(replacement);
  }

  targetFound(node) {
    this.path = node;
  }

  reset() {
    this.path = null;
    this.steps = 0;
    this.potential.reset();
    this.traversed.reset();
  }
}
