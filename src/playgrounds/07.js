import { PerspectiveCamera, Scene, SpotLight,
         BoxGeometry, MeshPhongMaterial, Mesh,
         ShaderMaterial, Texture, LinearFilter,
         PCFSoftShadowMap, ShaderChunk, SpotLightHelper,
         Vector2 } from 'three'
import TrackballControls from 'three-trackballcontrols'
import * as LightingShader from '../shaders/lighting'
import extend from 'extend'

class Playground {
  constructor (renderer, video) {
    this.renderer = renderer
    this.video = video

    // Update the renderer
    this.renderer.setClearColor(0xFF5CA6, 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.shadowMap.enabled = true

    // Make a camera and position it off center
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.z = 1000
    this.camera.position.x = -500

    // Make a scene, add the camera to it
    this.scene = new Scene()
    this.scene.add(this.camera)

    // Add a cube by making the shape, and the material,
    // and smooshing them together with a mesh
    const cubeGeometry = new BoxGeometry(100, 100, 100)
    const cubeMaterial = new MeshPhongMaterial({color: 0xFF5CA6})
    this.cube = new Mesh(cubeGeometry, cubeMaterial)
    this.cube.castShadow = true
    this.camera.lookAt(this.cube)
    this.scene.add(this.cube)

    // Mesh lambert material accepts light,
    // so let's add some light and shadow
    this.spotlight = new SpotLight(0xffffff)
    this.spotlight.position.set(0, 0, 250)
    this.spotlight.angle = 0.5 // The width of the spotlight
    this.spotlight.penumbra = 1 // How much the spotlight will fade out at the edges
    this.spotlight.intensity = 1 // How intense it is
    this.spotlight.castShadow = true
    this.scene.add(this.spotlight)

    // Define an angle to animate the spotlight around
    this.spotlightOrbit = 2 * Math.PI / 180
    this.spotlightRadius = 100

    // This helper visualises the light
    this.spotLightHelper = new SpotLightHelper(this.spotlight)
    this.scene.add(this.spotLightHelper)

    // Grab a video, make it a texture
    this.videoTexture = new Texture(video)
    this.videoTexture.minFilter = LinearFilter
    this.videoTexture.magFilter = LinearFilter

    // Use rendered scene as a material
    // And something to cast shadows onto
    this.planeWidth = 1200
    this.planeHeight = 900
    const planeGeometry = new BoxGeometry(this.planeWidth, this.planeHeight, 5)

    this.uniforms = extend(LightingShader.uniforms, {
      texture: {type: 't', value: this.videoTexture},
      textureFactor: {type: 'v2', value: new Vector2(0, 0)},
      resolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)},
      lightPosition: {type: 'v3', value: this.spotlight.position},
      time: {type: 'f', value: 0.0}
    })

    this.planeMaterial = new ShaderMaterial({
      vertexShader: this.shaderParse(LightingShader.vertexShader),
      fragmentShader: this.shaderParse(LightingShader.fragmentShader),
      uniforms: this.uniforms,
      lights: true,
      transparent: true
    })

    this.plane = new Mesh(planeGeometry, this.planeMaterial)
    this.plane.position.z = -100
    this.plane.castShadow = true
    this.plane.receiveShadow = true
    this.scene.add(this.plane)

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
  calculateAspectRatio () {
    const textureAspect = this.video.videoWidth / this.video.videoHeight
    const planeAspect = this.planeWidth / this.planeHeight
    this.uniforms.textureFactor.value = new Vector2(1, 1)

    if (textureAspect > planeAspect) {
      this.uniforms.textureFactor.value.x = textureAspect / planeAspect
    } else {
      this.uniforms.textureFactor.value.y = planeAspect / textureAspect
    }
  }
  replaceThreeChunkFn (a, b) {
    return ShaderChunk[b] + '\n'
  }
  shaderParse (glsl) {
    return glsl.replace(/\/\/\s?chunk\(\s?(\w+)\s?\);/g, this.replaceThreeChunkFn)
  }
  loop () {
    // Update time uniform
    this.uniforms.time.value += 0.1
    this.uniforms.lightPosition.value = this.spotlight.position

    // Rotate the cube
    this.cube.rotation.x += 0.001
    this.cube.rotation.y += 0.001
    this.cube.rotation.z += 0.001

    // Move the light about
    this.spotlightOrbit += 2 * Math.PI / 180
    this.spotlight.position.x = this.spotlightRadius * Math.sin(this.spotlightOrbit / 10) * Math.sin(this.spotlightOrbit)
    this.spotlight.position.y = this.spotlightRadius * Math.sin(this.spotlightOrbit / 10) * Math.cos(this.spotlightOrbit)

    // Update video texture
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.videoTexture) {
      this.videoTexture.needsUpdate = true
      if (this.uniforms.textureFactor.value.x === 0) this.calculateAspectRatio()
    }

    // Updates the trackball controls
    this.controls.update()

    // Updates the spotlight
    this.spotLightHelper.update()

    // Renders the scene
    this.renderer.render(this.scene, this.camera)
  }
}

export default Playground
