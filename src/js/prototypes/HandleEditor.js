import paper from 'paper'

import Handle from './Handle'

class HandleEditor {
  constructor(trueWidth, keyframeBefore, keyframeAfter, onMove) {
    this.trueWidth = trueWidth
    this.keyframeBefore = keyframeBefore
    this.keyframeAfter = keyframeAfter
    this.onMove = onMove
    this.paper = new paper.PaperScope()

    this.element = undefined
  }

  attatchTo = (id) => {
    const element = document.getElementById(id)
    this.element = element
    this.paper.setup(element)
  }

  destroy() {
    if (this.paper.project) {
      this.paper.project.clear()
      this.paper.project.remove()
    }
  }

  init() {
    // Assumes Width & Height are identical
    this.padding = 10
    this.width = this.trueWidth - (this.padding * 2)
    const { width, padding } = this

    const topLeft = [padding, padding]
    const topRight = [width + padding, padding]
    const bottomLeft = [padding, width + padding]
    // const bottomRight = [width, width + padding]
    const spacing = width / Handle.STEP
    const center = this.trueWidth / 2

    // Background
    new this.paper.Path.Rectangle({
      topLeft: [0, 0],
      bottomRight: [this.trueWidth, this.trueWidth],
      fillColor: 'rgb(210, 210, 210)',
    })

    // Gridlines
    const gridline = new this.paper.SymbolDefinition(
      new this.paper.Path.Line({
        from: [0, 0],
        to: [0, this.trueWidth],
        // strokeColor: '#324252',
        strokeColor: 'rgb(180, 180, 180)',
        strokeWidth: 2,
      })
    )
    for (let i = 0; i <= Handle.STEP; i += 1) {
      const offset = padding + 0 + (spacing * i)
      gridline.place(new this.paper.Point(offset, center))
      const offAxis = gridline.place(new this.paper.Point(center, offset))
      offAxis.rotate(90)
    }

    // Value Interpolation Curve
    this.curve = new this.paper.Path.Line({
      // strokeColor: '#2176ff',
      strokeColor: 'rgb(30, 155, 255)',
      strokeWidth: 2,
      from: new this.paper.Point(bottomLeft),
      to: new this.paper.Point(topRight),
    })
    this.setVisualCurveHandles()

    // Handle Strings
    const stringStyle = {
      // strokeColor: '#2176ff',
      strokeColor: 'rgb(30, 155, 255)',
      strokeWidth: 2,
    }
    const handleBeforeString = new this.paper.Path.Line({
      ...stringStyle,
      from: bottomLeft,
      to: this.handleBefore(),
    })
    const handleAfterString = new this.paper.Path.Line({
      ...stringStyle,
      from: this.handleAfter(),
      to: topRight,
    })

    // Handle Grips
    const handleMovable = new this.paper.SymbolDefinition(
      new this.paper.Path.Circle({
        point: topLeft,
        radius: 6,
        strokeColor: 'rgb(30, 155, 255)',
        strokeWidth: 2,
        fillColor: new this.paper.Color(1, 0.01),
      })
    )
    const handleStationary = new this.paper.SymbolDefinition(
      new this.paper.Path.Rectangle({
        point: [100, 100],
        size: [10, 10],
        fillColor: 'rgb(30, 155, 255)',
      })
    )
    handleStationary.place(bottomLeft)
    handleStationary.place(topRight)
    const handleBefore = handleMovable.place(this.handleBefore())
    const handleAfter = handleMovable.place(this.handleAfter())

    // Handle Events
    handleBefore.onMouseEnter = () => {
      this.element.style.cursor = 'pointer'
    }
    handleBefore.onMouseLeave = () => {
      this.element.style.cursor = 'default'
    }
    handleBefore.onMouseDrag = (event) => {
      this.element.style.cursor = 'pointer'
      const travelled = event.point.subtract(handleBefore.position)

      const xChange = Math.abs(travelled.x) >= (spacing / 2)
      const yChange = Math.abs(travelled.y) >= (spacing / 2)
      if (xChange || yChange) {
        const xSign = Math.sign(travelled.x)
        const ySign = Math.sign(travelled.y)
        const newPosition = handleBefore.position.add({
          x: xSign * spacing * xChange,
          y: ySign * spacing * yChange,
        })

        handleBefore.position = newPosition
        handleBeforeString.lastSegment.point = newPosition
        this.onMove('OUT', {
          influence: xSign * Handle.STEP * xChange,
          distance: -1 * ySign * Handle.STEP * yChange,
        })
        this.setVisualCurveHandles()
      }
    }
    handleBefore.onMouseUp = () => {
      this.element.style.cursor = 'default'
    }

    handleAfter.onMouseEnter = () => {
      this.element.style.cursor = 'pointer'
    }
    handleAfter.onMouseLeave = () => {
      this.element.style.cursor = 'default'
    }
    handleAfter.onMouseDrag = (event) => {
      this.element.style.cursor = 'pointer'
      const travelled = event.point.subtract(handleAfter.position)

      const xChange = Math.abs(travelled.x) >= (spacing / 2)
      const yChange = Math.abs(travelled.y) >= (spacing / 2)
      if (xChange || yChange) {
        const xSign = Math.sign(travelled.x)
        const ySign = Math.sign(travelled.y)
        const newPosition = handleAfter.position.add({
          x: xSign * spacing * xChange,
          y: ySign * spacing * yChange,
        })

        handleAfter.position = newPosition
        handleAfterString.firstSegment.point = newPosition
        this.onMove('IN', {
          influence: -1 * xSign * Handle.STEP * xChange,
          distance: ySign * Handle.STEP * yChange,
        })
        this.setVisualCurveHandles()
      }
    }
    handleAfter.onMouseUp = () => {
      this.element.style.cursor = 'default'
    }
  }


  handleBefore = () => (
    this.absoluteHandlePosition(this.keyframeBefore.handleOut.position)
  )

  handleAfter = () => (
    this.absoluteHandlePosition(this.keyframeAfter.handleIn.position)
  )

  absoluteHandlePosition(handlePosition) {
    return ([
      handlePosition.x * this.width + this.padding,
      // Compensates for 4th quadrant cartesian system
      this.width - (handlePosition.y * this.width) + this.padding,
    ])
  }

  setVisualCurveHandles() {
    if (this.curve) {
      this.curve.firstSegment.handleOut = new this.paper.Point(
        this.keyframeBefore.handleOut.influence * this.width / Handle.MAX,
        -1 * this.keyframeBefore.handleOut.distance * this.width / Handle.MAX
      )
      this.curve.lastSegment.handleIn = new this.paper.Point(
        -1 * this.keyframeAfter.handleIn.influence * this.width / Handle.MAX,
        this.keyframeAfter.handleIn.distance * this.width / Handle.MAX
      )
    }
  }
}

export default HandleEditor
