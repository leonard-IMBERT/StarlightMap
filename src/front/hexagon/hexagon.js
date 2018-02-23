export default class Hexagon {
  constructor(posx, posy, sizeX, sizeY, coordx, coordy, color = "#FFFFFF") {
    this.pos = {
      x: posx,
      y: posy
    }
    this.size = {
      x: sizeX,
      y: sizeY
    }
    this.coord = {
      x: coordx,
      y: coordy
    }
    this.color = color;
    this.active = false;
  }

  isIn(x, y) {
    if(Math.abs(this.pos.x - x) < this.size.x && Math.abs(this.pos.y - y) < this.size.y) {
      this.active = true;
    } else {
      this.active = false;
    }
    return this.active;
  }

  draw(drawer) {
    drawer.drawHexagon(this.pos.x, this.pos.y, this.size.x, this.color)
    drawer.drawText(this.pos.x, this.pos.y, this.coord.x + "," + this.coord.y)
  }
}
