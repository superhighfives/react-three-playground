/* eslint-disable */
const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`

const fragmentShader = `
  void main() {
    // Return pink pixels
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);'
  }
`

export { vertexShader, fragmentShader }
