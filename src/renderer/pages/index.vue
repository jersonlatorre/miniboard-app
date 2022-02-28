<template lang="pug">
#app
  #canvas(@wheel.preventDefault='onWheel($event)')
  #buttons
    .container
      .button.white(
        @click='setColor(colors[0])',
        :class='{ selected: currentColor == colors[0] && !isErasing }'
      )
      .button.yellow(
        @click='setColor(colors[1])',
        :class='{ selected: currentColor == colors[1] && !isErasing }'
      )
      .button.red(
        @click='setColor(colors[2])',
        :class='{ selected: currentColor == colors[2] && !isErasing }'
      )
      .button.blue(
        @click='setColor(colors[3])',
        :class='{ selected: currentColor == colors[3] && !isErasing }'
      )
      .button.eraser(
        @click='state = "pre-eraser"',
        :class='{ selected: isErasing }'
      )
</template>

<script>
import p5 from 'p5'
import Pressure from 'pressure'
import hotkeys from 'hotkeys-js'
import { Point, Line } from '../plugins/geometry'

export default {
  data() {
    return {
      colors: ['white', 'gold', 'red', '#0030FF'],
      pressure: 0,
      currentColor: 'white',
      backgroundColor: 'black',
      state: 'pre-draw', // pre-draw, draw, pre-eraser, eraser
      lines: [],
      currentLine: null,
      history: [],
      cameraX: 0,
      cameraY: 0,
      cameraZoom: 1,
      clickedPointX: 0,
      clickedPointY: 0,
      isMiddleMouseDown: false,
      isRightMouseDown: false,
    }
  },

  computed: {
    isErasing() {
      return this.state == 'eraser' || this.state == 'pre-eraser'
    },
  },
  methods: {
    onWheel(e) {
      this.cameraX += e.deltaX * this.cameraZoom
      this.cameraY += e.deltaY * this.cameraZoom
    },

    setColor(color) {
      this.state = 'pre-draw'
      this.currentColor = color
    },
  },

  mounted() {
    // non p5
    document.addEventListener('contextmenu', (event) => event.preventDefault())
    const foo = document.querySelector('.button')
    foo.addEventListener('click', (event) => {
      event.preventDefault()
    })

    Pressure.set(
      '#app',
      {
        change: (force) => {
          this.pressure = force
        },
      },
      { polyfillSpeedUp: 500 }
    )

    // shortcuts
    {
      hotkeys('ctrl+z, command+z', (e, h) => {
        if (this.lines.length > 0) {
          this.history.push(this.lines.pop())
        }
        this.currentLine = new Line(this.currentColor)
      })

      hotkeys('ctrl+y, command+y, ctrl+shift+z, command+shift+z', (e, h) => {
        if (this.history.length > 0) {
          this.lines.push(this.history.pop())
        }
        this.currentLine = new Line(this.currentColor)
      })

      hotkeys('1', (e, h) => {
        this.setColor(this.colors[0])
      })

      hotkeys('2', (e, h) => {
        this.setColor(this.colors[1])
      })

      hotkeys('3', (e, h) => {
        this.setColor(this.colors[2])
      })

      hotkeys('4', (e, h) => {
        this.setColor(this.colors[3])
      })

      hotkeys('e', (e, h) => {
        if (this.state === 'pre-draw') {
          this.state = 'pre-eraser'
        }
      })

      hotkeys('b', (e, h) => {
        if (this.state === 'pre-eraser') {
          this.state = 'pre-draw'
        }
      })
    }

    new p5((p) => {
      p.setup = () => {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight)

        canvas.parent('app')
        p.strokeJoin(p.ROUND)
        p.noCursor()
        this.currentLine = new Line(this.currentColor)
      }

      p.draw = () => {
        // is moving
        if (this.isMiddleMouseDown) {
          let dx = p.mouseX - p.pmouseX
          let dy = p.mouseY - p.pmouseY
          this.cameraX -= dx * this.cameraZoom
          this.cameraY -= dy * this.cameraZoom
        }

        // is scaling
        if (this.isRightMouseDown) {
          let dx = p.mouseX - p.pmouseX
          let dy = p.mouseY - p.pmouseY
          let deltaScale = -0.005 * dx * this.cameraZoom
          this.cameraZoom += deltaScale

          if (this.cameraZoom < 0.5) {
            this.cameraZoom = 0.5
            return
          }

          if (this.cameraZoom > 10) {
            this.cameraZoom = 10
            return
          }

          this.cameraX -= p.mouseX * deltaScale + dx * this.cameraZoom
          this.cameraY -= p.mouseY * deltaScale + dy * this.cameraZoom
        }

        switch (this.state) {
          case 'pre-draw':
            p.preDrawState()
            break
          case 'draw':
            p.drawState()
            break
          case 'pre-eraser':
            p.preEraserState()
            break
          case 'eraser':
            p.eraserState()
            break
        }
      }

      p.preDrawState = () => {
        p.background(this.backgroundColor)
        p.drawContent()
        p.drawCursorBrush()
      }

      p.drawState = () => {
        p.background(this.backgroundColor)
        p.drawContent()

        let worldX = this.cameraX + p.mouseX * this.cameraZoom
        let worldY = this.cameraY + p.mouseY * this.cameraZoom

        this.currentLine.addPoint(
          new Point(worldX, worldY, this.pressure * 4.5)
        )
        this.currentLine.draw(p, this.cameraX, this.cameraY, this.cameraZoom)

        p.drawCursorBrush()
      }

      p.preEraserState = () => {
        p.background(this.backgroundColor)
        p.drawContent()
        p.drawCursorEraser()
      }

      p.eraserState = () => {
        p.background(this.backgroundColor)
        p.drawContent()

        let worldX = this.cameraX + p.mouseX * this.cameraZoom
        let worldY = this.cameraY + p.mouseY * this.cameraZoom

        this.currentLine.addPoint(new Point(worldX, worldY, 15))
        this.currentLine.draw(p, this.cameraX, this.cameraY, this.cameraZoom)

        p.drawCursorEraser()
      }

      p.drawContent = () => {
        this.lines.forEach((line) => {
          line.draw(p, this.cameraX, this.cameraY, this.cameraZoom)
        })
      }

      p.drawCursorBrush = () => {
        p.noStroke()
        p.fill(this.currentColor)
        p.circle(p.mouseX, p.mouseY, 6)
      }

      p.drawCursorEraser = () => {
        p.stroke('white')
        p.strokeWeight(1)
        p.fill(this.backgroundColor)
        p.circle(p.mouseX, p.mouseY, 15)
      }

      document.querySelector('#canvas').addEventListener('mousedown', (e) => {
        // click izquierdo
        if (e.button == 0) {
          if (this.state == 'pre-draw') {
            this.currentLine = new Line(this.currentColor)
            this.history = []
            this.state = 'draw'
          } else if (this.state == 'pre-eraser') {
            this.currentLine = new Line(this.backgroundColor)
            this.history = []
            this.state = 'eraser'
          }
        }

        // click central
        if (e.button == 1) {
          this.isMiddleMouseDown = true
        }

        // click derecho
        if (e.button == 2) {
          this.isRightMouseDown = true
          this.clickedPointX = p.mouseX
          this.clickedPointY = p.mouseY
        }
      })

      document.querySelector('#canvas').addEventListener('mouseup', (e) => {
        // click izquierdo
        if (e.button == 0) {
          if (this.state == 'draw') {
            this.state = 'pre-draw'
            this.lines.push(this.currentLine)
            this.currentLine = new Line(this.currentColor)
          } else if (this.state == 'eraser') {
            this.state = 'pre-eraser'
            this.lines.push(this.currentLine)
            this.currentLine = new Line(this.currentColor)
          }
        }

        // click central
        if (e.button == 1) {
          this.isMiddleMouseDown = false
        }

        // click derecho
        if (e.button == 2) {
          this.isRightMouseDown = false
        }
      })

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
      }
    })
  },
}
</script>

<style lang="sass" scoped>
#app
  width: 100%
  height: 100%
  background-color: black
  overflow: hidden

  #canvas
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    cursor: none

  #buttons
    position: absolute
    left: 50%
    bottom: 6px
    border-radius: 23px
    transform: translateX(-50%)
    text-align: center
    padding: 3px
    background-color: rgba(255, 255, 255, 0.12)

    .container
      display: flex
      justify-content: space-between
      align-content: center

      .button
        width: 20px
        height: 20px
        margin: 4px
        border-radius: 50%
        cursor: pointer
        transition: all 0.2s ease-in-out
        position: relative

      .selected
        transform: scale(1.2)
        transition: all 0.08s ease-out

      .button:hover
        transform: scale(1.15)
        transition: all 0.08s ease-out

      .button:active
        transform: scale(1.1)
        transition: all 0.08s ease-out

      .red
        background-color: red
      .blue
        background-color: #0030FF
      .yellow
        background-color: gold
      .white
        background-color: white
      .eraser
        background-color: #ccc
        background-image: url(~/assets/images/eraser.svg)
        background-repeat: no-repeat
        background-position: center
        background-size: 16px 16px
</style>
