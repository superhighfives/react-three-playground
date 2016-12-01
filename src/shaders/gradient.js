/* eslint-disable */
const vertexShader = `
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform vec2 resolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 orange = vec4(0.533, 0.25, 0.145, 1.0);
    vec4 blue = vec4(0.18, 0.23, 0.27, 1.0);
    vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 white = vec4(1.0, 1.0, 1.0, 1.0);

    float ratio = resolution.x / resolution.y;
    float PI = 3.14159265359;

    vec4 mixC = mix(orange, blue, sin(ratio * uv.y));
    mixC = mix(mixC, black, cos(2.0 * PI * uv.x) / ratio);
    mixC = mix(mixC, black, cos(2.0 * PI * uv.y) / ratio);
    mixC = mix(mixC, white, 0.1);
    gl_FragColor = mixC;
  }
`

export { vertexShader, fragmentShader }
