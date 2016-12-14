import React, { Component } from 'react'
import Playground from './playgrounds/01'
import queryString from 'query-string'
import './index.css'

class App extends Component {
  constructor () {
    super()
    // Bind `this` to the animate and webcam functions
    this.animate = this.animate.bind(this)
    this.state = {
      overlay: queryString.parse(window.location.search).overlay === 'true',
      video: queryString.parse(window.location.search).video || '/videos/video.mp4',
      webcam: queryString.parse(window.location.search).webcam === 'true',
      canvas: queryString.parse(window.location.search).canvas === 'true'
    }
    if (module.hot) {
      // If hot reloading, stop events
      module.hot.dispose(() => {
        this.stopped = true
      })
    }
  }
  componentDidMount () {
    this.refs.app.appendChild(this.props.renderer.domElement)

    if (this.state.canvas) {
      this.getCanvas()
      .then(() => {
        // Create a playground by passing it the reference to the canvas
        // along with the canvas element we want to display
        this.playground = new Playground(this.props.renderer, this.refs.image)

        // Start the animation
        window.requestAnimationFrame(this.animate.bind(this))
      })
      .catch((e) => { throw new Error(e) })
    } else {
      this.getVideo()
      .then((videoSrc) => {
        this.refs.video.onloadedmetadata = (e) => {
          if (this.refs.video) this.refs.video.play()
        }
        this.refs.video.crossOrigin = ''
        this.refs.video.src = videoSrc
        // Create a playground by passing it the reference to the canvas
        // along with a looping video (which we'll use from 03 onwards)
        this.playground = new Playground(this.props.renderer, this.refs.video)

        // Start the animation
        window.requestAnimationFrame(this.animate.bind(this))
      })
      .catch((e) => { throw new Error(e) })
    }
  }
  getCanvas () {
    return new Promise((resolve, reject) => {
      let canvas = this.refs.image
      this.ctx = canvas.getContext('2d')
      resolve()
    })
  }
  getVideo () {
    return new Promise((resolve, reject) => {
      if (this.state.webcam) {
        window.navigator.getUserMedia = (window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia || window.navigator.msGetUserMedia)
        window.navigator.getUserMedia({video: true}, (localMediaStream) => {
          resolve(window.URL.createObjectURL(localMediaStream))
        }, e => reject(e))
      } else {
        resolve(this.state.video)
      }
    })
  }
  animate () {
    // Measure the stats and loop the playground
    this.props.stats.begin()
    this.playground.loop()
    this.props.stats.end()

    if (this.refs.image && this.ctx) {
      this.ctx.beginPath()
      this.ctx.rect(Math.random() * this.refs.image.width, Math.random() * this.refs.image.height, 50, 50)
      this.ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`
      this.ctx.fill()
      this.ctx.closePath()
    }

    // Keep looping the animation
    if (!this.stopped) window.requestAnimationFrame(this.animate)
  }
  render () {
    return (
      <div className='App' ref='app'>
        <canvas ref='image' width='1000' height='400' style={{display: 'none'}} />
        <video ref='video' style={{display: 'none'}} controls loop />
        {this.state.overlay &&
          <div className='overlay'>
            <h1 className='text' style={{display: 'block'}}>tinyurl.com/r3playground</h1>
          </div>
        }
      </div>
    )
  }
}

App.propTypes = {
  renderer: React.PropTypes.object,
  stats: React.PropTypes.object
}

export default App
