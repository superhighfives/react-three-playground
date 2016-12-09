import React from 'react'
import ReactDOM from 'react-dom'
import { WebGLRenderer } from 'three'
import Stats from 'stats.js'
import App from './App'
import './index.css'

const renderer = new WebGLRenderer({antialias: true})

const stats = new Stats()
document.body.appendChild(stats.dom)

const rootEl = document.getElementById('root')
ReactDOM.render(<App stats={stats} renderer={renderer} />, rootEl)

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    ReactDOM.render(<NextApp stats={stats} renderer={renderer} />, rootEl)
  })
}
