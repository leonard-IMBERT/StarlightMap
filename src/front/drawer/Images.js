/**
 * An image wrapper
 */
export default class Images {
  /**
   * The constructor
   */
  constructor() {
    /**
     * Boolean telling if the load has finished
     */
    this.loadFinished = false;
    /**
     * The data of the image
     */
    this.data = null;
  }

  /**
   * Load th image from the specified source
   * @param {string} src The source of the image
   * @param {number} width The width of the image
   * @param {number} height The height of the image
   * @param {number} x The x position of the image
   * @param {number} y The y position of the image
   * @returns {Promise<void>} A promise resolving when the image has finished loading
   */
  load(src, width, height, x, y) {
    /**
     * The width of the image
     */
    this.width = width;
    /**
     * The height of the image
     */
    this.height = height;
    /**
     * The x position of the image
     */
    this.x = x;
    /**
     * The y position of the image
     */
    this.y = y;

    return new Promise((res) => {
      this.data = new Image();
      this.data.src = src;
      this.data.onload = () => {
        this.loadFinished = true;
        res();
      };
    });
  }
}
