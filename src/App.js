import React, { Component } from 'react'
import Stats from 'stats.js'
import Playground from './playgrounds/01'
import queryString from 'query-string'
import './index.css'

const stats = new Stats()
document.body.appendChild(stats.dom)

class App extends Component {
  constructor () {
    super()
    // Bind `this` to the animate and webcam functions
    this.animate = this.animate.bind(this)
    this.state = {
      overlay: queryString.parse(window.location.search).overlay === 'true',
      video: queryString.parse(window.location.search).video || '/videos/wine.mp4',
      webcam: queryString.parse(window.location.search).webcam === 'true'
    }
  }
  componentDidMount () {
    this.getVideo()
      .then((videoSrc) => {
        this.refs.video.onloadedmetadata = (e) => {
          this.refs.video.play()
        }
        this.refs.video.crossOrigin = '';
        this.refs.video.src = videoSrc
        // Create a playground by passing it the reference to the canvas
        // along with a looping video (which we'll use from 03 onwards)
        this.playground = new Playground(this.refs.canvas, this.refs.video)

        // Start the animation
        window.requestAnimationFrame(this.animate.bind(this))
      })
      .catch((e) => { throw new Error(e) })
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
    stats.begin()
    this.playground.loop()
    stats.end()

    // Keep looping the animation
    window.requestAnimationFrame(this.animate)
  }
  render () {
    return (
      <div className='App'>
        <video ref='video' style={{display: 'none'}} controls loop />
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
