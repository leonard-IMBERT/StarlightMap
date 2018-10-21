/**
 * Class representing a position
 */
class Position {
  /**
   * The default constructor for a Position
   * @param {Number} x The x coordinate
   * @param {Number} y The y coordinate
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Return a representation of this object as a vanilla object
   * @returns {{x: Number, y: Number}} The representation
   */
  valueOf() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = Position;
