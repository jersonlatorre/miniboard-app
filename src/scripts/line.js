export default class Line {
  constructor(color, size) {
    this.color = color
    this.size = size
    this.points = []
  }

  addPoint(x, y) {
    this.points.push({ x, y })
  }

  draw(p) {
    if (this.points.length === 0) return
    if (this.points.length === 1) {
      p.push()
      p.noStroke()
      p.fill(this.color)
      p.circle(this.points[0].x, this.points[0].y, this.size)
      p.pop()
    }

    p.push()
    p.stroke(this.color)
    p.strokeWeight(this.size)
    p.noFill()
    p.beginShape() // begin Shape
    p.curveVertex(this.points[0].x, this.points[0].y) // duplicate first point
    this.points.forEach((point) => {
      p.curveVertex(point.x, point.y)
    })
    p.curveVertex(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y) // duplicate last point
    p.endShape() // end Shape
    p.pop()
  }
}
