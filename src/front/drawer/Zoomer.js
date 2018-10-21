import Point from './Point';

/**
 * A class translating coordinate from a zoomed plane to
 * a full scale plane
 */
export default class Zoomer {
  /**
   * @param {number} sizex The x size of the plane
   * @param {number} sizey The y size of the plane
   */
  constructor(sizex, sizey) {
    /**
     * The offset in x of the zoomed plane
     */
    this.offsetX = 0;
    /**
     * The offset in y of the zoomed plane
     */
    this.offsetY = 0;
    /**
     * The zoom scale
     */
    this.scale = 1;


    /**
     * The x size of the original plane
     */
    this.sizex = sizex;

    /**
     * The y size of the original plane
     */
    this.sizey = sizey;
  }

  /**
   * The x limit of the zoomed plane
   */
  limitx() { return (this.scale - 1) * this.sizex / 2; }

  /**
   * The y limit of the zoomed plane
   */
  limity() { return (this.scale - 1) * this.sizey / 2; }

  /**
   * Take a pair of coordinate from the zoomed plane
   * and return the coordinate in the original plane
   * @param {number} x The x postion
   * @param {number} y The y position
   */
  newPoint(x, y) {
    return new Point(x - this.offsetX, y - this.offsetY);
  }

  /**
   * Zoom in or out depending of the deltaZoom
   * Cannot have a scale inferior to 1/1
   * @param {number} deltaZoom How will we zoom in or out
   */
  zoom(deltaZoom) {
    this.scale += deltaZoom;
    this.scale = this.scale < 1 ? 1 : this.scale;
    this.isOut();
  }

  /**
   * Set the position of the zoom within the limit of the image
   */
  isOut() {
    if (this.offsetX < -this.limitx()) this.offsetX = -this.limitx();
    if (this.offsetX > this.limitx()) this.offsetX = this.limitx();
    if (this.offsetY < -this.limity()) this.offsetY = -this.limity();
    if (this.offsetY > this.limity()) this.offsetY = this.limity();
  }

  /**
   * move the zoom from a dx and a dy
   * @param {number} dx The x shift
   * @param {number} dy The y shift
   */
  moveZoom(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
    this.isOut();
  }

  /**
   * Translate the coordinate and execute a function passing the new coordinate
   * and the scale of the zoom
   * @param {Function} f The function execute
   * @param {number} x Original x coordinate
   * @param {number} y Original y coordinate
   */
  drawZoomed(f, x, y) {
    const newX = x - ((this.scale - 1) * this.sizex / 2) - this.offsetX;
    const newY = y - ((this.scale - 1) * this.sizey / 2) - this.offsetY;
    f(newX, newY, this.scale);
  }
}
