export default class Images {
  constructor() {
    this.loadFinished = false
    this.data = null
  }

  load(src, width, height, x, y) {
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    return new Promise((res, rej) => {
      this.data = new Image()
      this.data.src = src
      this.data.onload = () => {
        this.loadFinished = true
        res()
      }
    })
  }

}
