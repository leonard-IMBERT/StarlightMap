import Point from './Point';

/**
* Return the position of the i th corner of the hexagon
* @param {Point} center The center of the hexagon
* @param {number} size The size of the hexagon
* @param {number} i The index of the hexagon's corner
*/
export function HexCorner(center, size, i) {
  const angleDeg = 60 * i + 30;
  const angleRad = Math.PI / 180 * angleDeg;
  return new Point(center.x + size * Math.cos(angleRad),
    center.y + size * Math.sin(angleRad));
}

/**
 * Drawer object used to ease the drawing on canvas
 * */
export default class Drawer {
  /**
   * The basic constructor for the drawer
   * @param {HTMLCanvasElement} canvas The canvas on which the drawer will draw
   */
  constructor(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('The giving div is Either not a canvas or not an Html element');
    /**
     * The canvas on which the drawer will draw
     */
    this.canvas = canvas;

    /**
     * The context of the canvas
     */
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Set the size of the canvas
   * @param {number} x The width of the canvas
   * @param {number} y The height of the canvas
   */
  setSize(x, y) {
    this.canvas.height = y;
    this.canvas.width = x;
  }

  /**
   * Draw a rectangle on the canvas
   * @param {number} posX The x postion of the top left corner
   * @param {number} posY The y position of the top left corner
   * @param {number} height The height of the rectangle
   * @param {number} width The width of the rectangle
   * @param {string} color The color of the rectangle following the css standard for color
   */
  drawRectangle(posX, posY, height, width, color) {
    if (color) this.ctx.fillStyle = color;
    this.ctx.fillRect(posX, posY, height, width);
  }

  /**
   * Draw a text in a box
   * The box will automaticaly resize to fit the text
   * @param {number} posX The x position of the top left corner of the box
   * @param {number} posY The y position of the top left corner of the box
   * @param {string} text The text to draw
   * @param {string} textColor The color of the text
   * @param {string} boxColor The color of the box
   * @param {number} [fontSize=12] The font size (in px)
   * @param {string} [fontStyle="monospace"] The font of the text
   */
  drawTextBoxed(posX, posY, text, textColor, boxColor, fontSize = 12, fontStyle = 'monospace') {
    this.ctx.font = `${fontSize}px ${fontStyle}`;
    const measure = this.ctx.measureText(text);
    this.ctx.fillStyle = boxColor;
    this.ctx.fillRect(posX - 2, posY - 2 - fontSize, measure.width + 4, fontSize + 4);
    this.drawText(posX, posY, text, textColor);
  }

  /**
   * Draw some text on the canvas
   * @param {number} posX The x position of the text
   * @param {number} posY The y position of the text
   * @param {string} text The text to draw
   * @param {string} color The color of the text following the css standard for color name
   */
  drawText(posX, posY, text, color) {
    if (color) this.ctx.fillStyle = color;
    this.ctx.fillText(text, posX, posY);
  }

  /**
   * Draw an image with a specific scale
   * @param {number} posX The x position of the image
   * @param {number} posY The y position of the image
   * @param {number} scale The scale of the image
   * @param {Images} image The image to draw
   */
  drawImageScale(posX, posY, scale, image) {
    this.ctx.drawImage(
      image.data,
      image.x,
      image.y,
      image.width,
      image.height,
      posX,
      posY,
      image.width * scale,
      image.height * scale,
    );
  }

  /**
   * Draw an empty hexagon
   * @param {number} posx The x position of the hexagon
   * @param {number} posy The y position of the hexagon
   * @param {number} size The size of the hexagon
   * @param {string} color The color of the hexagon following the css standard for color
   */
  drawHexagon(posx, posy, size, color) {
    const center = new Point(posx, posy);
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;

    const cycle = [0, 1, 2, 3, 4, 5, 0];

    cycle.forEach((number) => {
      const point = HexCorner(center, size, number);
      this.ctx.lineTo(point.x, point.y);
    });

    this.ctx.stroke();
  }

  /**
   * Draw an image on the canvas
   * @param {number} posX The x position of the image
   * @param {number} posY The y position of the image
   * @param {number} width The width of the image
   * @param {number} height The height of the image
   * @param {Images} image The image to draw
   */
  drawImage(posX, posY, width, height, image) {
    this.ctx.drawImage(
      image.data,
      image.x,
      image.y,
      image.width,
      image.height,
      posX,
      posY,
      image.width,
      image.height,
    );
  }

  /**
   * Clean the canvas by drawing a white square on the canvas
   * */
  clean() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, 1000, 1000);
  }

  /**
   * Set the font of the canvas
   * @param {string} font The font to use
   */
  setFont(font) {
    this.ctx.font = font;
  }
}
