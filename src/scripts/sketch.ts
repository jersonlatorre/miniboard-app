import Line from './line'
import hotkeys from 'hotkeys-js'
import p5 from 'p5'

interface Config {
  backgroundColor: string
  brushSize: number
  brushColor: string
  eraserColor: string
}

interface Transform {
  x: number
  y: number
  scale: number
}

interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

declare module 'p5' {
  interface p5InstanceExtensions {
    updateWithProps: (props: Partial<Config>) => void
  }
}

const debounce = (func: (...args: unknown[]) => void) => {
  let timeout: number | null = null
  return (...args: unknown[]) => {
    if (timeout) window.cancelAnimationFrame(timeout)
    timeout = window.requestAnimationFrame(() => func(...args))
  }
}

const MAX_HISTORY = 50

export const sketch = (p: p5) => {
  const config: Config = {
    backgroundColor: '#111',
    brushSize: 3,
    brushColor: '#fff',
    eraserColor: '#111',
  }

  let state: 'none' | 'draw' | 'zoom' | 'pan' = 'none'
  let currentLine: Line | null = null
  let lines: Line[] = []
  let deletedLines: Line[] = []
  let panStartMouseX = 0
  let panStartMouseY = 0
  let zoomStartY = 0

  let canvas: p5.Renderer
  const transform: Transform = {
    x: 0,
    y: 0,
    scale: 1,
  }

  let lastBounds: Bounds | null = null
  let lastLinesLength = 0

  const undo = (e: KeyboardEvent) => {
    e.preventDefault()
    if (lines.length > 0) {
      const lastLine = lines.pop()
      if (lastLine) {
        deletedLines.push(lastLine)
        if (deletedLines.length > MAX_HISTORY) {
          deletedLines.shift()
        }
      }
      currentLine = null
    }
  }

  const redo = (e: KeyboardEvent) => {
    e.preventDefault()
    if (deletedLines.length > 0) {
      const restoredLine = deletedLines.pop()
      if (restoredLine) lines.push(restoredLine)
    }
  }

  const getMousePosition = (): p5.Vector => {
    return p.createVector((p.mouseX - transform.x) / transform.scale, (p.mouseY - transform.y) / transform.scale)
  }

  const handleMousePressed = (event: MouseEvent) => {
    const mousePos = getMousePosition()
    switch (event.button) {
      case 0:
        state = 'draw'
        currentLine = new Line(config.brushColor, config.brushSize)
        currentLine.addPoint(mousePos.x, mousePos.y)
        lines.push(currentLine)
        deletedLines = []
        break
      case 1:
        state = 'pan'
        panStartMouseX = p.mouseX
        panStartMouseY = p.mouseY
        break
      case 2:
        state = 'zoom'
        zoomStartY = p.mouseY
        break
    }
  }

  const handleMouseMoved = debounce(() => {
    if (state === 'pan' && p.mouseIsPressed) {
      const dx = p.mouseX - panStartMouseX
      const dy = p.mouseY - panStartMouseY

      transform.x += dx
      transform.y += dy

      panStartMouseX = p.mouseX
      panStartMouseY = p.mouseY
    } else if (state === 'zoom' && p.mouseIsPressed) {
      const dy = p.mouseY - zoomStartY
      const zoomIntensity = 0.005
      const zoomFactor = Math.exp(-dy * zoomIntensity)

      const mouseX = (p.mouseX - transform.x) / transform.scale
      const mouseY = (p.mouseY - transform.y) / transform.scale

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
  })

  const handleMouseReleased = () => {
    state = 'none'
  }

  const handleMouseWheel = (event: WheelEvent) => {
    event.preventDefault()
    const panIntensity = 2
    transform.x -= event.deltaX * panIntensity
    transform.y -= event.deltaY * panIntensity
  }

  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight)
    canvas.parent('whiteboard')
    canvas.elt.addEventListener('contextmenu', (e: Event) => e.preventDefault())

    hotkeys('command+z, ctrl+z', undo)
    hotkeys('command+shift+z, ctrl+shift+z', redo)

    canvas.mousePressed(handleMousePressed)
    canvas.mouseMoved(handleMouseMoved)
    canvas.mouseReleased(handleMouseReleased)
    canvas.mouseWheel(handleMouseWheel)
  }

  p.draw = () => {
    p.background(config.backgroundColor)

    p.push()
    p.translate(transform.x, transform.y)
    p.scale(transform.scale)

    lines.forEach((line) => line.draw(p))
    if (currentLine) currentLine.draw(p)

    p.pop()

    // comprobar si el cursor está sobre la barra de selección de colores
    const toolbarElement = document.querySelector('ul')
    let isOverToolbar = false

    if (toolbarElement) {
      const rect = toolbarElement.getBoundingClientRect()
      isOverToolbar = p.mouseX >= rect.left && p.mouseX <= rect.right && p.mouseY >= rect.top && p.mouseY <= rect.bottom
    }

    if (!isOverToolbar) {
      // dibujar cursor personalizado
      p.push()

      if (config.brushColor === config.backgroundColor) {
        // cursor para el borrador
        p.noFill()
        p.stroke(255) // borde blanco
        p.strokeWeight(1) // línea más delgada
        p.circle(p.mouseX, p.mouseY, config.brushSize)
        p.fill(config.backgroundColor) // usar el color de fondo (#111) en lugar de negro
        p.noStroke()
        p.circle(p.mouseX, p.mouseY, config.brushSize - 2)
      } else {
        // cursor para el pincel normal
        p.noStroke()
        p.fill(config.brushColor)
        p.circle(p.mouseX, p.mouseY, config.brushSize * 2)
      }

      p.pop()

      // ocultar el cursor del sistema
      document.body.style.cursor = 'none'
    } else {
      // restaurar cursor normal sobre la barra de herramientas
      document.body.style.cursor = 'default'
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.updateWithProps = (props: Partial<Config>) => {
    if (props.eraserColor) config.backgroundColor = props.eraserColor
    if (props.brushColor) {
      config.brushColor = props.brushColor
      config.brushSize = config.brushColor === config.backgroundColor ? 30 : 3
    }
  }

  p.keyPressed = () => {
    if (p.key === 'd') downloadAsPNG()
    if (p.key === 'c') clearCanvas()
  }

  const calculateBounds = (): Bounds => {
    if (lines.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }

    if (lastBounds && lastLinesLength === lines.length) {
      return lastBounds
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    lines.forEach((line) => {
      line.points.forEach((point) => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
    })

    lastBounds = { minX, minY, maxX, maxY }
    lastLinesLength = lines.length
    return lastBounds
  }

  const downloadAsPNG = () => {
    const { minX, minY, maxX, maxY } = calculateBounds()
    const width = maxX - minX + 200
    const height = maxY - minY + 200

    const offscreenGraphics = p.createGraphics(width, height)
    offscreenGraphics.background(config.backgroundColor)
    offscreenGraphics.push()
    offscreenGraphics.translate(-minX + 100, -minY + 100)

    lines.forEach((line) => line.draw(offscreenGraphics))

    offscreenGraphics.pop()

    offscreenGraphics.save('dibujo_completo.png')
    window.dispatchEvent(new CustomEvent('imageSaved'))
  }

  const clearCanvas = () => {
    lines = []
    deletedLines = []
    currentLine = null
  }
}
