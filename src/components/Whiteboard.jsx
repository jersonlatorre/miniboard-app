/* eslint-disable react-hooks/exhaustive-deps */
import './Whiteboard.scss'

import { useCallback, useContext, useEffect, useRef } from 'react'

import { WorkspaceContext } from '../contexts/WorkspaceContext'
import hotkeys from 'hotkeys-js'
import p5 from 'p5'

class Line {
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

export default function Whiteboard() {
  const { brushColor, eraserColor } = useContext(WorkspaceContext)
  const p5Ref = useRef(null)
  const linesRef = useRef([])
  const deletedLinesRef = useRef([])

  const undo = useCallback(() => {
    const lines = linesRef.current
    const deletedLines = deletedLinesRef.current
    if (lines.length > 0) {
      const lineToRemove = lines.pop()
      deletedLines.push(lineToRemove)
    }
  }, [])

  const redo = useCallback(() => {
    const lines = linesRef.current
    const deletedLines = deletedLinesRef.current
    if (deletedLines.length > 0) {
      const lineToRestore = deletedLines.pop()
      lines.push(lineToRestore)
    }
  }, [])

  const sketch = (p) => {
    const backgroundColor = eraserColor
    let brushSize = 3
    let brushColor

    let currentLine = null
    let offsetX = 0
    let offsetY = 0
    let zoom = 1
    let dragging = false
    let zoomCenter = null
    let canvas
    let prevMouseY = 0

    p.setup = () => {
      canvas = p.createCanvas(p.windowWidth, p.windowHeight).parent('whiteboard')

      canvas.elt.addEventListener('contextmenu', function (e) {
        e.preventDefault()
      })

      // handle mouse events on canvas
      canvas.mousePressed(() => {
        // zoom origin
        if (p.mouseButton === p.RIGHT) {
          zoomCenter = { x: p.mouseX, y: p.mouseY }
          prevMouseY = p.mouseY
          return false
        }

        // start dragging
        if (p.mouseButton === p.CENTER) {
          dragging = true
          return false
        }

        // create new line
        currentLine = new Line(brushColor, brushSize)
        currentLine.addPoint((p.mouseX - p.width / 2) / zoom + p.width / 2 - offsetX, (p.mouseY - p.height / 2) / zoom + p.height / 2 - offsetY)
      })

      canvas.mouseMoved(() => {
        
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

        // handle dragging
        if (dragging) {
          offsetX += (p.mouseX - p.pmouseX) / zoom
          offsetY += (p.mouseY - p.pmouseY) / zoom
          return false
        }

        // add point
        if (currentLine) {
          currentLine.addPoint((p.mouseX - p.width / 2) / zoom + p.width / 2 - offsetX, (p.mouseY - p.height / 2) / zoom + p.height / 2 - offsetY)
        }
      })

      canvas.mouseReleased(() => {
        // stop dragging
        if (p.mouseButton === p.CENTER) {
          dragging = false
          return false
        }

        // stop zoom
        if (p.mouseButton === p.RIGHT) {
          zoomCenter = null
          return false
        }

        // finish line
        if (currentLine && currentLine.points.length > 0 && p.mouseButton === p.LEFT) {
          linesRef.current.push(currentLine) // Usa useRef para manejar las líneas
          currentLine = null
        }

        // clear deleted lines
        deletedLinesRef.current = []
      })

      canvas.mouseOut(() => {
        dragging = false
        zoomCenter = null

        // finish line
        if (currentLine && currentLine.points.length > 0 && p.mouseButton === p.LEFT) {
          linesRef.current.push(currentLine) // Usa useRef para manejar las líneas
          currentLine = null
        }
      })

      canvas.mouseWheel((e) => {
        offsetX -= e.deltaX / zoom
        offsetY -= e.deltaY / zoom
      })
    }

    p.draw = () => {
      p.background(backgroundColor)
      p.translate(p.width / 2, p.height / 2)
      p.scale(zoom)
      p.translate(-p.width / 2 + offsetX, -p.height / 2 + offsetY)

      linesRef.current.forEach((line) => line.draw(p))
      if (currentLine) currentLine.draw(p)
    }

    p.updateBrushColor = (newBrushColor) => {
      brushColor = newBrushColor
    }

    p.updateBrushSize = (newBrushSize) => {
      brushSize = newBrushSize
    }

    // p.windowResized = () => {
    //   p.resizeCanvas(p.windowWidth, p.windowHeight)
    // }
  }

  useEffect(() => {
    hotkeys('command+z, ctrl+z', () => undo())
    hotkeys('command+shift+z, ctrl+shift+z', () => redo())

    return () => {
      hotkeys.unbind('command+z, ctrl+z')
      hotkeys.unbind('command+shift+z, ctrl+shift+z')
    }
  }, [undo, redo])

  useEffect(() => {
    if (!p5Ref.current) {
      p5Ref.current = new p5(sketch)
    }

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove()
        p5Ref.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.updateBrushColor(brushColor)
      if (brushColor === eraserColor) {
        p5Ref.current.updateBrushSize(15)
      } else {
        p5Ref.current.updateBrushSize(3)
      }
    }
  }, [brushColor, eraserColor])

  return <div id="whiteboard"></div>
}
