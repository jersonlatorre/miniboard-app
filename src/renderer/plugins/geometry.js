export class Point {
  constructor(x, y, size) {
    this.x = x
    this.y = y
    this.size = size
  }
}

export class Line {
  constructor(color) {
    this.points = []
    this.color = color
  }

  addPoint(point) {
    this.points.push(point)
  }

  draw(p, cameraX, cameraY, cameraZoom) {
    for (let i = 0; i < this.points.length - 1; i++) {
      let start = this.points[i]
      let end = this.points[i + 1]
      p.strokeWeight(start.size / cameraZoom)
      p.stroke(this.color)
      let screenStartX = (start.x - cameraX) / cameraZoom
      let screenStartY = (start.y - cameraY) / cameraZoom
      let screenEndX = (end.x - cameraX) / cameraZoom
      let screenEndY = (end.y - cameraY) / cameraZoom
      p.line(screenStartX, screenStartY, screenEndX, screenEndY)
    }
  }
}
