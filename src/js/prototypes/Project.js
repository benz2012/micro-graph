import { observable, action } from 'mobx'
import paper from 'paper'

import Animation from './Animation'

import { downloadJSON } from '../util/download'

class Project {
  @observable name
  @observable inputItems
  @observable inputBuilt

  constructor(rootStore) {
    this.rootStore = rootStore
    this.initialize()
  }

  initialize() {
    if (paper.project) {
      paper.project.clear()
      paper.project.remove()
    }
    this.name = 'My Animation'
    this.inputItems = undefined
    this.inputBuilt = false
  }

  toJSON() {
    return ({
      name: this.name,
    })
  }

  @action setName(name) {
    this.name = name
  }

  clear = () => {
    paper.project.clear()
    paper.project.remove()

    const { canvas, animation } = this.rootStore
    canvas.setSize(undefined, undefined)
    animation.setIn(Animation.FIRST)
    animation.setOut(animation.frames)
  }

  load = (inputJSON, fileName) => {
    // this.inputItems = undefined
    // this.inputBuilt = false
    // BUG: this needs to clear the whole project, similar to what the clear button does

    const { canvas, animation } = this.rootStore
    const input = JSON.parse(inputJSON)

    const name = fileName || input.project.name
    this.setName(name.replace(/\.[^/.]+$/, ''))

    Object.keys(input.animation).forEach((key) => {
      animation[key] = input.animation[key]
    })

    Object.keys(input.canvas).forEach((key) => {
      if (key === 'animatables') {
        this.inputItems = input.canvas.animatables
      } else {
        canvas[key] = input.canvas[key]
      }
    })

    this.rootStore.mode.set('BUILD')
  }

  loadFromFile = (event) => {
    const { files } = event.target
    const targetFile = files[0]
    const reader = new FileReader()
    reader.onload = () => this.load(reader.result, targetFile.name)

    this.rootStore.reset()
    reader.readAsText(targetFile)
  }

  save = () => {
    /* eslint no-param-reassign: 0 */
    const { canvas, animation } = this.rootStore
    const projectAsJSON = JSON.stringify({
      project: this.toJSON(),
      animation: animation.toJSON(),
      canvas: canvas.toJSON(),
    })
    return projectAsJSON
  }

  download = (object) => {
    downloadJSON(object, this.name)
  }

  publish = () => {
    console.log('publishing project')
  }

  // render() {
  //   // render canvas animation to frames
  // }
}

export default Project
