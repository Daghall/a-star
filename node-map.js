export default class NodeMap {
  constructor() {
    this.reset();
  }

  add(node) {
    const index = this.getIndex(node);
    this.map[index] = node;
    ++this.size;
  }

  remove(node) {
    const index = this.getIndex(node);
    delete this.map[index];
    --this.size;
  }

  get(x, y) {
    const index = this.getIndex({x, y});
    return this.map[index];
  }

  replace(replacement) {
    this.add(replacement);
  }

  reset() {
    this.size = 0;
    this.map = {};
  }

  getIndex(node) {
    const {x, y} = node;
    return `${x}:${y}`;
  }

  toArray() {
    return Object.values(this.map);
  }
}
