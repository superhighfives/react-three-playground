import { Vector2 } from 'three'

const uniforms = {
  texture: { type: 't', value: null },
  textureFactor: {type: 'v2', value: new Vector2(1, 1)}
}

/* eslint-disable */
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
  varying vec2 vUv;

  void main() {
    vec4 initialTexture = texture2D(texture, vec2(vUv.x, vUv.y));
    vec4 greyscale = initialTexture * vec4(0.3, 0.59, 0.11, 1.0);
    float luminance = greyscale.r + greyscale.g + greyscale.b;
    vec4 color = vec4(vec3(luminance, luminance, luminance), 1.0);
    gl_FragColor = color;
  }
`

export { vertexShader, fragmentShader, uniforms }
