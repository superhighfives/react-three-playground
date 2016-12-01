import React, { Component } from 'react'
import Stats from 'stats.js'
import Playground from './playgrounds/05'
import './index.css'

const stats = new Stats()
document.body.appendChild(stats.dom)

class App extends Component {
  constructor () {
    super()
    // Bind `this` to the animate function
    this.animate = this.animate.bind(this)
    this.state = {overlay: false}
  }
  componentDidMount () {
    // Create a playground by passing it the reference to the canvas
    // along with a looping video (which we'll use from 03 onwards)
    this.playground = new Playground(this.refs.canvas, this.refs.video)

    // Start the animation
    window.requestAnimationFrame(this.animate.bind(this))
  }
  animate () {
    // Measure the stats and loop the playground
    stats.begin()
    this.playground.loop()
    stats.end()

    // Keep looping the animation
    window.requestAnimationFrame(this.animate)
  }
  render () {
    return (
      <div className='App'>
        <video ref='video' style={{display: 'none'}} src='/videos/wine.mp4' autoPlay controls loop />
        <canvas ref='canvas' />
        {this.state.overlay &&
          <div className='overlay'>
            <h1 className='text' style={{display: 'block'}}>You are doing a great job</h1>
          </div>
        }
      </div>
    )
  }
}

export default App
