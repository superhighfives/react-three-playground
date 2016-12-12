/* eslint-disable */
import { Vector2, Vector4, UniformsLib, UniformsUtils,
         ShaderChunk } from 'three'

const uniforms = UniformsUtils.merge([
  UniformsLib['lights'], {
    time: {type: 'f', value: 0.0 },
  }
])

const vertexShader = `
  uniform float time;

  varying vec3 vViewPosition;
  varying vec3 vPosition;

  ${ShaderChunk["common"]}
  ${ShaderChunk["shadowmap_pars_vertex"]}

  void main() {
    // Adding some displacement based on the vertex position
    vec3 offset = vec3(
      sin(position.x + (time / 5.0)) * 15.0,
      sin(position.y + (time / 5.0) + 31.512) * 15.0,
      sin(position.z + (time / 5.0) + 112.512) * 15.0
    );

    vec3 pos = position + offset;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = - mvPosition.xyz; // vector from vertex to camera
    vPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;

    ${ShaderChunk["shadowmap_vertex"]}
  }
`

const fragmentShader = `
  uniform vec3 color;
  varying vec3 vViewPosition;
  varying vec3 vPosition;

  ${ShaderChunk["common"]}
  ${ShaderChunk["bsdfs"]}
  ${ShaderChunk["packing"]}
  ${ShaderChunk["lights_pars"]}
  ${ShaderChunk["shadowmap_pars_fragment"]}
  ${ShaderChunk["fog_pars_fragment"]}
  ${ShaderChunk["bumpmap_pars_fragment"]}

  void main() {
    vec3 outgoingLight = color.rgb;
    vec3 normal = normalize( cross( dFdx( vViewPosition ), dFdy( vViewPosition ) ) );
    vec4 addedLights = vec4(0., 0., 0., 1.);
    #if NUM_POINT_LIGHTS > 0
      for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 lightDirection = normalize(vPosition - pointLights[l].position);
        addedLights.rgb += clamp(dot(-lightDirection, normal), 0.0, 1.0) * pointLights[l].color;
      }
    #endif
    vec4 c = vec4(outgoingLight, 1.) * addedLights;
    gl_FragColor = c * vec4(outgoingLight, 1.);
  }
`

export { vertexShader, fragmentShader, uniforms }
