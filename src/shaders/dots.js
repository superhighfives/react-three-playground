/* eslint-disable */
import { Vector2, Vector4 } from 'three'

const uniforms = {
  scale: {type: 'f', value: 1000.0},
  intensity: {type: 'f', value: 1.0 },
  offsetRepeat: {type: 'v4', value: new Vector4(0.5, 0.5, 1.0, 1.0) },
  texture: { type: 't', value: null },
  textureFactor: {type: 'v2', value: new Vector2(1, 1)}
}

const vertexShader = `
  varying vec2 vUv;
  uniform vec4 offsetRepeat;
  varying vec2 vUvPattern;
  uniform vec2 textureFactor;
  void main() {
    vUv = vec2(0.5 + (uv.x - 0.5) / textureFactor.x, 0.5 + (uv.y - 0.5) / textureFactor.y);
    vUvPattern = uv * offsetRepeat.zw + offsetRepeat.xy;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D texture;
  uniform float time;
  uniform float scale;
  uniform float intensity;
  varying vec2 vUv;
  varying vec2 vUvPattern;

  float pattern() {
    float s = sin(time / 500.0);
    float c = cos(time / 500.0);
    vec2 point = vec2(c * vUvPattern.x - s * vUvPattern.y, s * vUvPattern.x + c * vUvPattern.y) * scale;
    return (sin(point.x) * sin(point.y)) * 4.0;
  }

  void main() {
    vec4 texel = texture2D(texture, vUv);
    vec3 color = texel.rgb;
    color = vec3(color * 10.0 - 5.0 + pattern());
    color = texel.rgb + (color - texel.rgb) * intensity;
    gl_FragColor = vec4(color, texel.a);
  }
`

export { vertexShader, fragmentShader, uniforms }
