import { CurveInterpolator } from 'curve-interpolator'

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
		this.interpolatedPoints = []
		this.sizes = []
		this.color = color
	}

	addPoint(point) {
		this.points.push([ point.x, point.y, point.size ])
		this.smoothLine()
	}

	smoothLine() {
    let correctedPoints = [this.points[0], ...this.points, this.points[this.points.length - 1]]
    let interpolator = new CurveInterpolator(correctedPoints, { tension: 0.2 })
		this.interpolatedPoints = interpolator.getPoints(parseInt(interpolator.length / 15) + 1)
	}

	draw(p, cameraX, cameraY, cameraZoom) {
		// for (let i = 0; i < this.interpolatedPoints.length - 1; i++) {
		// 	let start = this.interpolatedPoints[i]
		// 	let end = this.interpolatedPoints[i + 1]
		// 	let size = this.interpolatedPoints[i + 1][2]

		// 	p.strokeWeight(size / cameraZoom)
		// 	p.stroke(this.color)

		// 	let screenStartX = (start[0] - cameraX) / cameraZoom
		// 	let screenStartY = (start[1] - cameraY) / cameraZoom
		// 	let screenEndX = (end[0] - cameraX) / cameraZoom
		// 	let screenEndY = (end[1] - cameraY) / cameraZoom
		// 	p.line(screenStartX, screenStartY, screenEndX, screenEndY)
		// }

    let pointsToDraw = this.interpolatedPoints.map((point, i) => {
      return [point[0] + p.noise(-0, 0), point[1] + p.random(-0, 0), point[2]+ p.random(-1, 1)]
    })

    for (let i = 0; i < pointsToDraw.length; i++) {
			let point = pointsToDraw[i]
			let size = pointsToDraw[i][2]

			p.strokeWeight(size / cameraZoom)
			p.fill(this.color)
      p.noStroke()

			let screenX = (point[0] - cameraX) / cameraZoom
			let screenY = (point[1] - cameraY) / cameraZoom
			p.circle(screenX, screenY, size)
		}
	}
}
