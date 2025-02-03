import p5 from 'p5'

interface Point {
  x: number
  y: number
}

export default class Line {
  private color: string
  private size: number
  public points: Point[]

  constructor(color: string, size: number) {
    this.color = color
    this.size = size
    this.points = []
  }

  addPoint(x: number, y: number): void {
    this.points.push({ x, y })
  }

  draw(p: p5): void {
    if (this.points.length === 0) return

    if (this.points.length === 1) {
      p.push()
      p.noStroke()
      p.fill(this.color)
      p.circle(this.points[0].x, this.points[0].y, this.size)
      p.pop()
      return
    }

    p.push()
    p.stroke(this.color)
    p.strokeWeight(this.size)
    p.noFill()

    if (this.points.length <= 3) {
      p.beginShape()
      this.points.forEach((point) => {
        p.vertex(point.x, point.y)
      })
      p.endShape()
    } else {
      p.beginShape()
      p.curveVertex(this.points[0].x, this.points[0].y)
      this.points.forEach((point) => {
        p.curveVertex(point.x, point.y)
      })
      p.curveVertex(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y)
      p.endShape()
    }

    p.pop()
  }
}
