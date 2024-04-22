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
    if (lines.length > 0) deletedLines.push(lines.pop())
  }

  const redo = (e) => {
    e.preventDefault()
    if (deletedLines.length > 0) lines.push(deletedLines.pop())
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
      const zoomIntensity = 0.01

      let newScale = transform.scale + dy * zoomIntensity
      newScale = Math.max(0.2, Math.min(5, newScale))
      const scaleFactor = newScale / transform.scale

      transform.x = p.mouseX - scaleFactor * (p.mouseX - transform.x)
      transform.y = p.mouseY - scaleFactor * (p.mouseY - transform.y)
      transform.scale = newScale

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
    // Evita el comportamiento predeterminado del navegador
    event.preventDefault()

    // Configura la intensidad del paneo
    const panIntensity = 5

    // Calcula el desplazamiento basado en la dirección del scroll
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

    p.translate(transform.x, transform.y)
    p.scale(transform.scale)

    lines.forEach((line) => line.draw(p))
    if (currentLine) currentLine.draw(p)
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
}
