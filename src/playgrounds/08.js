import { PerspectiveCamera, Scene } from 'three'
import TrackballControls from 'three-trackballcontrols'
import Ocean from '../three/ocean'

class Playground {
  constructor (renderer, video) {
    this.renderer = renderer
    this.video = video

    this.lastTime = (new Date()).getTime()

    // Update the renderer
    this.renderer.setClearColor(0x222222, 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.context.getExtension('OES_texture_float')
    this.renderer.context.getExtension('OES_texture_float_linear')

    // Make a camera and position it off center
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.set(100, -33, -12)

    // Make a scene, add the camera to it
    this.scene = new Scene()
    this.scene.add(this.camera)

    this.ocean = new Ocean(this.renderer, this.camera, this.scene)
    this.ocean.materialOcean.uniforms.u_projectionMatrix = {value: this.camera.projectionMatrix}
    this.ocean.materialOcean.uniforms.u_viewMatrix = {value: this.camera.matrixWorldInverse}
    this.ocean.materialOcean.uniforms.u_cameraPosition = {value: this.camera.position}
    this.scene.add(this.ocean.oceanMesh)

    // Add controls so you can navigate the scene
    this.controls = new TrackballControls(this.camera, this.renderer.domElement)

    // Resize things when the window resizes
    window.addEventListener('resize', this.onResize.bind(this))
  }
  onResize () {
    // Update the camera's aspect ratio and the renderer's size
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
  loop () {
    let currentTime = new Date().getTime()
    this.ocean.deltaTime = (currentTime - this.lastTime) / 1000 || 0.0
    this.lastTime = currentTime
    this.ocean.render(this.ocean.deltaTime)
    if (this.ocean.changed) {
      this.ocean.materialOcean.uniforms.u_size.value = this.ocean.size
      this.ocean.materialOcean.uniforms.u_sunDirection.value.set(this.ocean.sunDirectionX, this.ocean.sunDirectionY, this.ocean.sunDirectionZ)
      this.ocean.materialOcean.uniforms.u_exposure.value = this.ocean.exposure
      this.ocean.changed = false
    }
    this.ocean.overrideMaterial = this.ocean.materialOcean
    this.ocean.materialOcean.uniforms.u_normalMap.value = this.ocean.normalMapFramebuffer.texture
    this.ocean.materialOcean.uniforms.u_displacementMap.value = this.ocean.displacementMapFramebuffer.texture
    this.ocean.materialOcean.uniforms.u_projectionMatrix.value = this.camera.projectionMatrix
    this.ocean.materialOcean.uniforms.u_viewMatrix.value = this.camera.matrixWorldInverse
    this.ocean.materialOcean.uniforms.u_cameraPosition.value = this.camera.position
    this.ocean.materialOcean.depthTest = true

    // Updates the trackball controls
    this.controls.update()

    // Renders the scene
    this.renderer.render(this.scene, this.camera)
  }
}

export default Playground
