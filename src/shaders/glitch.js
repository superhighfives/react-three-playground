/* eslint-disable */
import { Vector2, DataTexture, RGBFormat, FloatType, Math } from 'three'

const generatePerturbMap = () => {
  let i, x
  let l = 64 * 64
  let data = new Float32Array(l * 3)

  for(i = 0; i < l; ++i) {
    x = Math.randFloat(0, 1)
    data[i * 3] = x
    data[i * 3 + 1] = x
    data[i * 3 + 2] = x
  }
  let perturbMap = new DataTexture(data, 64, 64, RGBFormat, FloatType)
  perturbMap.needsUpdate = true
  return perturbMap
}

const uniforms = {
	tPerturb: {value: generatePerturbMap()},
	amount: {value: 0.8},
	angle: {value: 0.02},
	seed: {value: window.Math.random()},
	seedX: {value: 0.02},
	seedY: {value: 0.02},
	distortionX: {value: 0.5},
	distortionY: {value: 0.6},
	colS: {value: 0.05},
  texture: { type: 't', value: null },
  textureFactor: {type: 'v2', value: new Vector2(1, 1)}
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
  uniform sampler2D tPerturb;

  uniform float amount;
  uniform float angle;
  uniform float seed;
  uniform float seedX;
  uniform float seedY;
  uniform float distortionX;
  uniform float distortionY;
  uniform float colS;

  varying vec2 vUv;

  float rand(vec2 tc) {
    const float a = 12.9898;
    const float b = 78.233;
    const float c = 43758.5453;

    float dt = dot(tc, vec2(a, b));
    float sn = mod(dt, 3.14);

    return fract(sin(sn) * c);
  }

  void main() {
    vec2 coord = vUv;
    float xs, ys;
    vec4 normal;
    vec2 offset;
    vec4 cr, cga, cb;
    vec4 snow, color;
    float sx, sy;

    xs = floor(gl_FragCoord.x / 0.5);
    ys = floor(gl_FragCoord.y / 0.5);

    normal = texture2D(tPerturb, coord * seed * seed);

    if(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {
      sx = clamp(ceil(seedX), 0.0, 1.0);
      coord.y = sx * (1.0 - (coord.y + distortionY)) + (1.0 - sx) * distortionY;
    }
    if(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {
      sy = clamp(ceil(seedY), 0.0, 1.0);
      coord.x = sy * distortionX + (1.0 - sy) * (1.0 - (coord.x + distortionX));
    }
    coord.x += normal.x * seedX * (seed / 5.0);
    coord.y += normal.y * seedY * (seed / 5.0);

    offset = amount * vec2(cos(angle), sin(angle));

    cr = texture2D(texture, coord + offset);
    cga = texture2D(texture, coord);
    cb = texture2D(texture, coord - offset);

    color = vec4(cr.r, cga.g, cb.b, cga.a);
    snow = 200.0 * amount * vec4(rand(vec2(xs * seed, ys * seed * 50.0)) * 0.2);
    color += snow;

    gl_FragColor = color;
  }
`

let counter = 0
const render = () => {
  uniforms.amount.value = window.Math.sin(counter) * window.Math.random() / 90.0
	uniforms.angle.value = Math.randFloat(-window.Math.PI, window.Math.PI)
	uniforms.distortionX.value = window.Math.sin(counter) * Math.randFloat(0.0, 1.0)
	uniforms.distortionY.value = window.Math.sin(counter) * Math.randFloat(0.0, 1.0)
	uniforms.seedX.value = window.Math.sin(counter) * Math.randFloat(-0.3, 0.3)
	uniforms.seedY.value = window.Math.sin(counter) * Math.randFloat(-0.3, 0.3)
  counter += 0.1
}

export { vertexShader, fragmentShader, uniforms, render }
