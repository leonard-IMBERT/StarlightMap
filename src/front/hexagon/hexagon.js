/* eslint-disable no-unused-vars */
import Drawer from '../drawer/Drawer';
import Zoomer from '../drawer/Zoomer';
import Point from '../drawer/Point';
/* eslint-enable */

export default class Hexagon {
  constructor(posx, posy, sizeX, sizeY, coordx, coordy, color = '#FFFFFF') {
    /**
     * The position (on the screen) of the hexagon
     */
    this.pos = {
      x: posx,
      y: posy,
    };

    /**
     * The size of the hexagon
     */
    this.size = {
      x: sizeX,
      y: sizeY,
    };

    /**
     * The coordinate (on the map) of the hexagon
     */
    this.coord = {
      x: coordx,
      y: coordy,
    };

    /**
     * The color of the outlie of the hexagon
     */
    this.color = color;

    /**
     * Boolean teeeling if the hexagon must be shown
     */
    this.active = false;

    /**
     * Boolean telling if the hexagon has been selected
     */
    this.select = false;
  }

  /**
   * Return a boolean telling if the position (on the screen) is in the hexagon
   * @param {number} x - The x coordinate to test
   * @param {number} y - The y coordinate to test
   * @returns true if the point is in the hexagon, false if not
   */
  isIn(x, y) {
    const dist = Math.sqrt((Math.abs(this.pos.x - x) ** 2) + (Math.abs(this.pos.y - y) ** 2));

    if (dist < this.size.y) {
      this.active = true;
    } else {
      this.active = false;
    }
    return this.active;
  }

  /**
   * Draw the hexagon on the given drawer
   * @param {Drawer} drawer - The drawer on which draw
   * @param {Zoomer} zoomer - The zoomer to use
   * @param {number=} labelOffset - The offset of the label from the hexagon position
   */
  draw(drawer, zoomer, labelOffset) {
    const lOffset = labelOffset || 0;
    drawer.drawHexagon(
      (this.pos.x - zoomer.zoomOffset().x) * zoomer.scale,
      (this.pos.y - zoomer.zoomOffset().y) * zoomer.scale,
      this.size.x * zoomer.scale,
      this.color,
    );
    drawer.drawTextBoxed((this.pos.x - zoomer.zoomOffset().x) * zoomer.scale - this.size.x,
      (this.pos.y - zoomer.zoomOffset().y) * zoomer.scale - this.size.y - 2 - lOffset,
      `${this.coord.x}, ${this.coord.y}`,
      this.color, '#000000');
  }
}
