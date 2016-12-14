import { PerspectiveCamera, Scene, PointLight,
         BoxGeometry, Mesh, ShaderMaterial,
         PCFSoftShadowMap, PointLightHelper,
         LinearFilter, Texture, Vector2 } from 'three'
import TrackballControls from 'three-trackballcontrols'
import EffectComposer, { RenderPass, ShaderPass, CopyShader } from 'three-effectcomposer-es6'
import * as LightingShader from '../shaders/lighting'
import * as TVShader from '../shaders/tv'
// import * as GreyscaleShader from '../shaders/greyscale'
import extend from 'extend'

class Playground {
  constructor (renderer, image) {
    this.renderer = renderer
    this.image = image

    // Update the renderer
    this.renderer.setClearColor(0xffad17, 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.shadowMap.enabled = true
    this.renderer.context.getExtension('OES_standard_derivatives')

    // Make a camera and position it off center
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.z = 800

    // Make a scene, add the camera to it
    this.scene = new Scene()
    this.scene.add(this.camera)

    // Mesh lambert material accepts light,
    // so let's add some light and shadow
    this.pointlight = new PointLight(0xBA7F10)
    this.pointlight.intensity = 2.0
    this.pointlight.position.set(0, 0, 100)
    this.pointlight.castShadow = true
    this.scene.add(this.pointlight)

    // Define an angle to animate the spotlight around
    this.pointlightOrbit = 2 * Math.PI / 180
    this.pointlightRadius = 250

    this.pointLightHelper = new PointLightHelper(this.pointlight)
    this.scene.add(this.pointLightHelper)

    // Grab a video, make it a texture
    this.imageTexture = new Texture(image)
    this.imageTexture.minFilter = LinearFilter
    this.imageTexture.magFilter = LinearFilter

    // Give it something to exist on
    this.planeWidth = 1200
    this.planeHeight = 900
    this.uniforms = extend(LightingShader.uniforms, {
      texture: {type: 't', value: this.imageTexture},
      textureFactor: {type: 'v2', value: new Vector2(0, 0)},
      resolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)},
      lightPosition: {type: 'v3', value: this.pointlight.position},
      time: {type: 'f', value: 0.0}
    })
    const planeGeometry = new BoxGeometry(this.planeWidth, this.planeHeight, 50)
    const planeMaterial = new ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable'
      },
      vertexShader: LightingShader.vertexShader,
      fragmentShader: LightingShader.fragmentShader,
      uniforms: this.uniforms,
      lights: true,
      transparent: true
    })
    this.plane = new Mesh(planeGeometry, planeMaterial)
    this.plane.position.z = -100
    this.plane.castShadow = true
    this.plane.receiveShadow = true
    this.scene.add(this.plane)

    // Add controls so you can navigate the scene
    this.controls = new TrackballControls(this.camera, this.renderer.domElement)

    this.effectComposer = new EffectComposer(this.renderer)

    let renderPass = new RenderPass(this.scene, this.camera)
    this.effectComposer.addPass(renderPass)

    // let greyscalePass = new ShaderPass(GreyscaleShader, 'texture')
    // this.effectComposer.addPass(greyscalePass)

    this.tvPass = new ShaderPass(TVShader, 'texture')
    this.effectComposer.addPass(this.tvPass)

    let copyPass = new ShaderPass(CopyShader)
    this.effectComposer.addPass(copyPass)
    copyPass.renderToScreen = true

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
    const textureAspect = this.image.width / this.image.height
    const planeAspect = this.planeWidth / this.planeHeight
    this.uniforms.textureFactor.value = new Vector2(1, 1)

    if (textureAspect > planeAspect) {
      this.uniforms.textureFactor.value.x = textureAspect / planeAspect
    } else {
      this.uniforms.textureFactor.value.y = planeAspect / textureAspect
    }
  }
  loop () {
    // Update time uniform
    this.uniforms.time.value += 0.1
    this.tvPass.uniforms.time.value += 0.01
    this.uniforms.lightPosition.value = this.pointlight.position

    this.pointlightOrbit += 2 * Math.PI / 180
    this.pointlight.position.x = this.pointlightRadius * Math.sin(this.pointlightOrbit)
    this.pointlight.position.y = this.pointlightRadius * Math.cos(this.pointlightOrbit)

    // Update the pointlight helper
    this.pointLightHelper.update()

    // Update video texture
    if (this.imageTexture) {
      this.imageTexture.needsUpdate = true
      if (this.uniforms.textureFactor.value.x === 0) this.calculateAspectRatio()
    }

    // Updates the trackball controls
    this.controls.update()

    // Renders the scene
    this.effectComposer.render(this.uniforms.time)
  }
}

export default Playground
