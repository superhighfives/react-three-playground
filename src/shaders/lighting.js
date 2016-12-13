import { UniformsUtils, UniformsLib } from 'three'

/* eslint-disable */
const uniforms = UniformsUtils.merge([
  UniformsLib['lights'], {
    texture: { type: 't', value: null },
    opacity: {value: 1.0}
  }
])

const vertexShader = `
  // chunk(shadowmap_pars_vertex);

  varying vec2 vUv;
  uniform vec2 textureFactor;

  void main() {
    vUv = vec2(0.5 + (uv.x - 0.5) / textureFactor.x, 0.5 + (uv.y - 0.5) / textureFactor.y);

    vec3 transformed = vec3(position);
    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
  	vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

    // chunk(shadowmap_vertex);
  }
`

const fragmentShader = `
  uniform float opacity;

  // chunk(common);
  // chunk(packing);
  // chunk(bsdfs);
  // chunk(lights_pars);
  // chunk(shadowmap_pars_fragment);
  // chunk(shadowmask_pars_fragment);

  uniform sampler2D texture;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(texture, vUv);
    gl_FragColor = vec4(vec3(color.xyz * getShadowMask()), 1.0);
  }
`

export { vertexShader, fragmentShader, uniforms }
