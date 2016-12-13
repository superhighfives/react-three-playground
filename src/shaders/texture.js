/* eslint-disable */
import { Vector2 } from 'three'

const uniforms = {
  texture: { type: 't', value: null },
  textureFactor: {type: "v2", value: new Vector2(1, 1)}
}

const vertexShader = `
  varying vec2 vUv;
  uniform vec2 textureFactor;
  void main() {
    vUv = vec2(0.5 + (uv.x - 0.5) / textureFactor.x, 0.5 + (uv.y - 0.5) / textureFactor.y);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D texture;
  uniform vec2 resolution;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(texture, vUv);
    gl_FragColor = color;
  }
`

export { vertexShader, fragmentShader, uniforms }
