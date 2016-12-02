import { OrthographicCamera, Scene,
         PlaneGeometry, Mesh,
         ShaderMaterial, Texture, LinearFilter,
         Vector2 } from 'three'
import { vertexShader, fragmentShader, uniforms, render } from '../shaders/dots'
import extend from 'extend'

class Playground {
  constructor (renderer, video) {
    this.renderer = renderer
    this.video = video

    // Update the renderer
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // Make a camera and position it off center
    this.sizes = this.getOrthographicSizes()
    this.camera = new OrthographicCamera(this.sizes.left, this.sizes.right, this.sizes.top, this.sizes.bottom, 0, 10)
    this.camera.position.z = 1

    // Make a scene, add the camera to it
    this.scene = new Scene()
    this.scene.add(this.camera)

    // Grab a video, make it a texture
    this.videoTexture = new Texture(video)
    this.videoTexture.minFilter = LinearFilter
    this.videoTexture.magFilter = LinearFilter

    // And something to cast shadows onto
    const planeSize = this.getGeometrySize()
    const planeGeometry = new PlaneGeometry(planeSize, planeSize, 1, 1)
    this.uniforms = extend(uniforms, {
      texture: {type: 't', value: this.videoTexture},
      resolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)},
      time: {type: 'f', value: 0.0}
    })
    this.planeMaterial = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms
    })
    this.plane = new Mesh(planeGeometry, this.planeMaterial)
    this.scene.add(this.plane)

    // Resize things when the window resizes
    window.addEventListener('resize', this.onResize.bind(this))
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
  onResize () {
    // Rebuild the mesh with the new geometry
    this.scene.remove(this.plane)
    let size = this.getGeometrySize()
    let geometry = new PlaneGeometry(size, size, 1, 1)
    this.plane = new Mesh(geometry, this.planeMaterial)
    this.scene.add(this.plane)

    // Udpate the camera
    let sizes = this.getOrthographicSizes()
    this.camera.left = sizes.left
    this.camera.right = sizes.right
    this.camera.top = sizes.top
    this.camera.bottom = sizes.bottom
    this.camera.updateProjectionMatrix()

    // Reset the renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
  loop () {
    if (render) render()

    // Update time uniform
    this.uniforms.time.value += 0.1

    // Update video texture
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.videoTexture) {
      this.videoTexture.needsUpdate = true
    }

    // Renders the scene
    this.renderer.render(this.scene, this.camera)
  }
}

export default Playground
