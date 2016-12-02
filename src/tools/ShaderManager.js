import { WebGLRenderTarget, LinearFilter,
         Scene, OrthographicCamera, PlaneGeometry,
         ShaderMaterial, Mesh, Vector2 } from 'three'
import extend from 'extend'

class ShaderManager {
  constructor (baseTexture) {
    this.previousTexture = baseTexture
    this.passes = []
    this.sizes = this.getOrthographicSizes()
    this.camera = new OrthographicCamera(this.sizes.left, this.sizes.right, this.sizes.top, this.sizes.bottom, 0, 10)
    this.camera.position.z = 1
  }
  add (shader) {
    const pass = {}
    pass.buffer = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: LinearFilter,
      stencilBuffer: false,
      depthBuffer: false
    })
    pass.previousTexture = this.previousTexture
    this.previousTexture = pass.buffer.texture
    pass.shader = shader

    const geometrySize = this.getGeometrySize()
    pass.geometry = new PlaneGeometry(geometrySize, geometrySize, 1, 1)
    pass.uniforms = extend(pass.shader.uniforms, {
      texture: {type: 't', value: pass.previousTexture},
      resolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)},
      time: {type: 'f', value: 0.0}
    })
    pass.material = new ShaderMaterial({
      vertexShader: pass.shader.vertexShader,
      fragmentShader: pass.shader.fragmentShader,
      uniforms: pass.uniforms
    })
    pass.mesh = new Mesh(pass.geometry, pass.material)

    pass.scene = new Scene()
    pass.scene.add(this.camera)
    pass.scene.add(pass.mesh)

    this.passes.push(pass)
  }
  render (renderer) {
    this.passes.forEach((pass) => {
      pass.uniforms.time.value += 0.1
      if (pass.shader.render) pass.shader.render()
      renderer.render(pass.scene, this.camera, pass.buffer, true)
    })
  }
  texture () {
    return this.passes[this.passes.length - 1].buffer.texture
  }
  getOrthographicSizes () {
    // Get the right sizes / sides for the orthographic camera
    let aspect = 9 / 16
    let width = window.innerWidth
    let height = window.innerHeight
    return {
      left: aspect * width / -2,
      right: aspect * width / 2,
      top: height / 2,
      bottom: height / -2
    }
  }
  getGeometrySize () {
    // Get the size for the geometry based on the
    // current window width and height
    let width = window.innerWidth
    let height = window.innerHeight
    if (height >= width) {
      return Math.max(width, height)
    } else {
      return Math.min(width, height)
    }
  }
}

export default ShaderManager
