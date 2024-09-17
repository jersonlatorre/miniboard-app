import Line from './line'
import hotkeys from 'hotkeys-js'

export const sketch = (p) => {
  // Configuración
  const config = {
    backgroundColor: '#111',
    brushSize: 3,
    brushColor: '#fff',
  }

  // Estado
  let state = 'none' // 'draw', 'zoom', 'pan'
  let currentLine
  let lines = []
  let deletedLines = []
  let panStartX = 0
  let panStartY = 0
  let zoomStartY = 0

  // Canvas
  let canvas
  let transform = {
    x: 0,
    y: 0,
    scale: 1,
  }

  // Funciones
  const undo = (e) => {
    e.preventDefault()
    if (lines.length > 0) {
      const lastLine = lines.pop()
      deletedLines.push(lastLine)
      currentLine = null // Asegura que no se continúe dibujando la línea eliminada
    }
  }

  const redo = (e) => {
    e.preventDefault()
    if (deletedLines.length > 0) {
      const restoredLine = deletedLines.pop()
      lines.push(restoredLine)
    }
  }

  const getMousePosition = () => {
    return p.createVector((p.mouseX - transform.x) / transform.scale, (p.mouseY - transform.y) / transform.scale)
  }

  const handleMousePressed = (event) => {
    const mousePos = getMousePosition()
    switch (event.button) {
      case 0: // Left button
        state = 'draw'
        currentLine = new Line(config.brushColor, config.brushSize)
        currentLine.addPoint(mousePos.x, mousePos.y)
        lines.push(currentLine)
        deletedLines = []
        break
      case 1: // Middle button
        state = 'pan'
        panStartX = p.mouseX
        panStartY = p.mouseY
        break
      case 2: // Right button
        state = 'zoom'
        zoomStartY = p.mouseY
        break
    }
  }

  const handleMouseMoved = () => {
    if (state === 'pan' && p.mouseIsPressed) {
      const dx = p.mouseX - panStartX
      const dy = p.mouseY - panStartY

      transform.x += dx
      transform.y += dy

      panStartX = p.mouseX
      panStartY = p.mouseY
    } else if (state === 'zoom' && p.mouseIsPressed) {
      const dy = p.mouseY - zoomStartY
      const zoomIntensity = 0.005
      const zoomFactor = Math.exp(-dy * zoomIntensity)

      const mouseX = (p.mouseX - transform.x) / transform.scale
      const mouseY = (p.mouseY - transform.y) / transform.scale

      // Aplicar límites al zoom
      const minZoom = 0.1
      const maxZoom = 5
      const newScale = p.constrain(transform.scale * zoomFactor, minZoom, maxZoom)

      transform.scale = newScale
      transform.x = p.mouseX - mouseX * transform.scale
      transform.y = p.mouseY - mouseY * transform.scale

      zoomStartY = p.mouseY
    } else if (state === 'draw' && currentLine) {
      const mousePos = getMousePosition()
      currentLine.addPoint(mousePos.x, mousePos.y)
    }
  }

  const handleMouseReleased = () => {
    state = 'none'
  }

  const handleMouseWheel = (event) => {
    event.preventDefault()
    const panIntensity = 2
    transform.x -= event.deltaX * panIntensity
    transform.y -= event.deltaY * panIntensity
  }

  // Setup
  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent('whiteboard')
    canvas.elt.addEventListener('contextmenu', (e) => e.preventDefault())

    hotkeys('command+z, ctrl+z', undo)
    hotkeys('command+shift+z, ctrl+shift+z', redo)

    canvas.mousePressed(handleMousePressed)
    canvas.mouseMoved(handleMouseMoved)
    canvas.mouseReleased(handleMouseReleased)
    canvas.mouseWheel(handleMouseWheel)
  }

  // Draw
  p.draw = () => {
    p.background(config.backgroundColor)

    p.push()
    p.translate(transform.x, transform.y)
    p.scale(transform.scale)

    lines.forEach((line) => line.draw(p))
    if (currentLine) currentLine.draw(p)

    p.pop()
  }

  // Resize
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  // Update with props
  p.updateWithProps = (props) => {
    if (props.eraserColor) config.backgroundColor = props.eraserColor
    if (props.brushColor) {
      config.brushColor = props.brushColor
      config.brushSize = config.brushColor === config.backgroundColor ? 20 : 3
    }
  }

  p.keyPressed = () => {
    if (p.key === 'd') downloadAsPNG()
    if (p.key === 'c') clearCanvas()
  }

  const calculateBounds = () => {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    lines.forEach((line) => {
      line.points.forEach((point) => {
        if (point.x < minX) minX = point.x
        if (point.y < minY) minY = point.y
        if (point.x > maxX) maxX = point.x
        if (point.y > maxY) maxY = point.y
      })
    })

    return { minX, minY, maxX, maxY }
  }

  const downloadAsPNG = () => {
    const { minX, minY, maxX, maxY } = calculateBounds()
    const width = maxX - minX + 200
    const height = maxY - minY + 200

    let offscreenGraphics = p.createGraphics(width, height)
    offscreenGraphics.background(config.backgroundColor)

    offscreenGraphics.push()
    offscreenGraphics.translate(-minX + 100, -minY + 100)

    lines.forEach((line) => line.draw(offscreenGraphics))

    offscreenGraphics.pop()

    offscreenGraphics.save('dibujo_completo.png')
  }

  const clearCanvas = () => {
    lines = []
    deletedLines = []
    currentLine = null
  }
}
