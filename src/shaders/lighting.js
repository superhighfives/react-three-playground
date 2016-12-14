/* eslint-disable */
import { Vector2, Vector4, UniformsLib, UniformsUtils,
         ShaderChunk, Color } from 'three'

const uniforms = UniformsUtils.merge([
  UniformsLib['lights'], {
    texture: { type: 't', value: null },
    time: {type: 'f', value: 0.0 },
    influence: {type: 'f', value: 15.0},
    color: {type: 'c', value: new Color(0xffffff)},
    textureFactor: {type: 'v2', value: new Vector2(1, 1)}
  }
])

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform float time;
  uniform vec2 textureFactor;
  uniform float influence;

  void main() {
    vUv = vec2(0.5 + (uv.x - 0.5) / textureFactor.x, 0.5 + (uv.y - 0.5) / textureFactor.y);

    // Adding some displacement based on the vertex position
    vec3 offset = vec3(
      sin(position.x + (time / 5.0)) * influence,
      sin(position.y + (time / 5.0) + 31.512) * influence,
      sin(position.z + (time / 5.0) + 112.512) * influence
    );

    vec3 pos = position + offset;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = `
  uniform vec3 color;
  varying vec3 vPosition;

  ${ShaderChunk["common"]}
  ${ShaderChunk["bsdfs"]}
  ${ShaderChunk["packing"]}
  ${ShaderChunk["lights_pars"]}
  ${ShaderChunk["shadowmap_pars_fragment"]}
  ${ShaderChunk["fog_pars_fragment"]}
  ${ShaderChunk["bumpmap_pars_fragment"]}

  uniform sampler2D texture;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(texture, vUv);
    vec3 outgoingLight = color.rgb;
    vec3 normal = normalize( cross( dFdx( -vPosition ), dFdy( -vPosition ) ) );
    vec4 addedLights = vec4(0., 0., 0., 1.);
    #if NUM_POINT_LIGHTS > 0
      for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 lightDirection = normalize(vPosition - pointLights[l].position);
        addedLights.rgb += clamp(dot(-lightDirection, normal), 0.0, 1.0) * pointLights[l].color;
      }
    #endif
    vec4 c = vec4(outgoingLight, 1.) * addedLights;
    gl_FragColor = c * vec4(vec3(tex.xyz + outgoingLight), 1.);
  }
`

export { vertexShader, fragmentShader, uniforms }
