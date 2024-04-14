import Line from './line'
import hotkeys from 'hotkeys-js'

export const sketch = (p) => {
  let backgroundColor = '#111'
  let brushSize = 3
  let brushColor

  let canvas
  let offsetX = 0
  let offsetY = 0
  let zoom = 1
  let zoomCenter
  let panning = false
  let prevMouseX
  let prevMouseY

  let currentLine
  let lines = []
  let deletedLines = []

  const undo = (e) => {
    e.preventDefault()
    if (lines.length > 0) deletedLines.push(lines.pop())
  }

  const redo = (e) => {
    e.preventDefault()
    if (deletedLines.length > 0) lines.push(deletedLines.pop())
  }

  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent('whiteboard')
    canvas.elt.addEventListener('contextmenu', (e) => e.preventDefault())

    hotkeys('command+z, ctrl+z', undo)
    hotkeys('command+shift+z, ctrl+shift+z', redo)

    canvas.mousePressed(handleMousePressed)
    canvas.mouseMoved(handleMouseMoved)
    canvas.mouseReleased(handleMouseReleased)
    canvas.mouseOut(handleMouseOut)
    canvas.mouseWheel(handleMouseWheel)
  }

  p.draw = () => {
    p.background(backgroundColor)
    p.translate(p.width / 2, p.height / 2)
    p.scale(zoom)
    p.translate(-p.width / 2 + offsetX, -p.height / 2 + offsetY)

    lines.forEach((line) => line.draw(p))
    if (currentLine) currentLine.draw(p)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  const handleMousePressed = () => {
    // start zoom
    if (p.mouseButton === p.RIGHT) {
      zoomCenter = { x: p.mouseX, y: p.mouseY }
      prevMouseY = p.mouseY
      prevMouseX = p.mouseX
      return false
    }

    // start pan
    if (p.mouseButton === p.CENTER) {
      prevMouseY = p.mouseY
      prevMouseX = p.mouseX
      panning = true
      return false
    }

    // create new line
    currentLine = new Line(brushColor, brushSize)
    currentLine.addPoint((p.mouseX - p.width / 2) / zoom + p.width / 2 - offsetX, (p.mouseY - p.height / 2) / zoom + p.height / 2 - offsetY)
  }

  const handleMouseMoved = () => {
    // handle zoom
    if (p.mouseButton === p.RIGHT && zoomCenter) {
      const zoomIntensity = 0.005
      let newZoom = zoom + (p.mouseY - prevMouseY) * zoomIntensity
      newZoom = p.constrain(newZoom, 0.1, 5)

      const zoomPointX = (zoomCenter.x - p.width / 2 + offsetX) / zoom
      const zoomPointY = (zoomCenter.y - p.height / 2 + offsetY) / zoom

      offsetX -= zoomPointX * newZoom - zoomPointX * zoom
      offsetY -= zoomPointY * newZoom - zoomPointY * zoom

      zoom = newZoom
      prevMouseY = p.mouseY
      return false
    }

    // panning
    if (panning) {
      offsetX += (p.mouseX - prevMouseX) / zoom
      offsetY += (p.mouseY - prevMouseY) / zoom
      prevMouseX = p.mouseX
      prevMouseY = p.mouseY
      return false
    }

    // add point
    if (currentLine) {
      currentLine.addPoint((p.mouseX - p.width / 2) / zoom + p.width / 2 - offsetX, (p.mouseY - p.height / 2) / zoom + p.height / 2 - offsetY)
    }
  }

  const handleMouseReleased = () => {
    // stop zoom
    if (p.mouseButton === p.RIGHT) {
      zoomCenter = null
      return false
    }

    // stop pan
    if (p.mouseButton === p.CENTER) {
      panning = false
      return false
    }

    // finish line
    if (currentLine && currentLine.points.length > 0 && p.mouseButton === p.LEFT) {
      lines.push(currentLine)
      currentLine = null
    }

    // clear deleted lines
    deletedLines = []
  }

  const handleMouseOut = () => {
    panning = false
    zoomCenter = null

    // finish line
    if (currentLine && currentLine.points.length > 0 && p.mouseButton === p.LEFT) {
      lines.push(currentLine)
      currentLine = null
    }
  }

  const handleMouseWheel = (e) => {
    offsetX -= e.deltaX / zoom
    offsetY -= e.deltaY / zoom
  }

  p.updateWithProps = (props) => {
    if (props.eraserColor) backgroundColor = props.eraserColor
    if (props.brushColor) {
      brushColor = props.brushColor
      if (brushColor === backgroundColor) brushSize = 15
      else brushSize = 3
    }
  }
}
