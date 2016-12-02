import React from 'react'
import ReactDOM from 'react-dom'
import { WebGLRenderer } from 'three'
import App from './App'
import './index.css'

const renderer = new WebGLRenderer({antialias: true})

const rootEl = document.getElementById('root')
ReactDOM.render(<App renderer={renderer} />, rootEl)

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    ReactDOM.render(<NextApp renderer={renderer} />, rootEl)
  })
}
