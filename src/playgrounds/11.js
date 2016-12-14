import { PerspectiveCamera, Scene, PointLight,
         BoxGeometry, Mesh, ShaderMaterial,
         PCFSoftShadowMap, PointLightHelper, Raycaster,
         LinearFilter, Texture, Vector2, Vector3, Math as TMath } from 'three'
import TrackballControls from 'three-trackballcontrols'
import EffectComposer, { RenderPass, ShaderPass, CopyShader } from 'three-effectcomposer-es6'
import * as LightingShader from '../shaders/lighting'
import * as TVShader from '../shaders/tv'
import * as DotsShader from '../shaders/dots'
import * as GlitchShader from '../shaders/glitch'
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

    // Projector, for mouse events
    this.raycaster = new Raycaster()
    this.mouse = new Vector2()

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
    this.plane.name = 'plane'
    this.plane.position.z = -100
    this.plane.castShadow = true
    this.plane.receiveShadow = true
    this.scene.add(this.plane)

    // Add controls so you can navigate the scene
    this.controls = new TrackballControls(this.camera, this.renderer.domElement)

    this.effectComposer = new EffectComposer(this.renderer)

    let renderPass = new RenderPass(this.scene, this.camera)
    this.effectComposer.addPass(renderPass)

    this.dotsPass = new ShaderPass(DotsShader, 'texture')
    this.effectComposer.addPass(this.dotsPass)

    this.tvPass = new ShaderPass(TVShader, 'texture')
    this.effectComposer.addPass(this.tvPass)

    this.glitchPass = new ShaderPass(GlitchShader, 'texture')
    this.glitchPass.uniforms.distortionX.value = -1.0
    this.glitchPass.uniforms.distortionY.value = -1.0
    this.effectComposer.addPass(this.glitchPass)

    let copyPass = new ShaderPass(CopyShader)
    this.effectComposer.addPass(copyPass)
    copyPass.renderToScreen = true

    window.document.addEventListener('mouseenter', this.onMouseEnter.bind(this), false)
    window.document.addEventListener('mouseleave', this.onMouseLeave.bind(this), false)
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false)

    // Resize things when the window resizes
    window.addEventListener('resize', this.onResize.bind(this))
  }
  onMouseEnter (event) {
    this.mouseenter = true
  }
  onMouseLeave (event) {
    this.mouseenter = false
  }
  onMouseMove (event) {
    this.mouse.x = (event.clientX / this.renderer.domElement.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.renderer.domElement.height) * 2 + 1
  }
  onResize () {
    // Update the camera's aspect ratio and the renderer's size
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
  calculateAspectRatio () {
    const imageWidth = this.image.width || this.image.videoWidth
    const imageHeight = this.image.height || this.image.videoHeight
    const textureAspect = imageWidth / imageHeight
    const planeAspect = this.planeWidth / this.planeHeight
    this.uniforms.textureFactor.value = new Vector2(1, 1)

    if (textureAspect > planeAspect) {
      this.uniforms.textureFactor.value.x = textureAspect / planeAspect
    } else {
      this.uniforms.textureFactor.value.y = planeAspect / textureAspect
    }
  }
  loop () {
    // Check for mouse
    if (this.mouseenter) {
      this.raycaster.setFromCamera(this.mouse, this.camera)
      let intersects = this.raycaster.intersectObjects(this.scene.children)
      if(intersects.length) {
        intersects.forEach((child) => {
          this.partytime = child.object.name === 'plane'
        })
      } else {
        this.partytime = false
      }
    } else {
      this.partytime = false
    }

    // Update time uniform
    this.uniforms.time.value += 0.1

    if(this.partytime) {
      this.dotsPass.enabled = true
      this.glitchPass.enabled = true
      this.tvPass.enabled = true
    } else {
      this.dotsPass.enabled = false
      this.glitchPass.enabled = false
      this.tvPass.enabled = false
    }

    // Shaders!
    if (this.tvPass) {
      this.tvPass.uniforms.time.value += 0.01
    }

    if (this.glitchPass && this.partytime) {
      this.glitchPass.uniforms.amount.value = window.Math.sin(this.uniforms.time.value) / 90.0
      this.glitchPass.uniforms.angle.value = TMath.randFloat(-window.Math.PI, window.Math.PI)
      this.glitchPass.uniforms.seedX.value = window.Math.sin(this.uniforms.time.value) * TMath.randFloat(-0.3, 0.3)
      this.glitchPass.uniforms.seedY.value = window.Math.sin(this.uniforms.time.value) * TMath.randFloat(-0.3, 0.3)
    } else if (this.glitchPass && !this.partytime) {
      this.glitchPass.uniforms.amount.value = 0.01
    }

    this.uniforms.lightPosition.value = this.pointlight.position

    // Rotate the pointlight
    this.pointlightOrbit += 2 * Math.PI / 180
    this.pointlight.position.x = this.pointlightRadius * Math.sin(this.pointlightOrbit)
    this.pointlight.position.y = this.pointlightRadius * Math.cos(this.pointlightOrbit)

    // Update the pointlight helper
    this.pointLightHelper.update()

    // Update video texture
    if (this.imageTexture) {
      if (this.image.tagName.toLowerCase() === 'video') {
        if (this.image.readyState === this.image.HAVE_ENOUGH_DATA) {
          this.imageTexture.needsUpdate = true
          if (this.uniforms.textureFactor.value.x === 0) this.calculateAspectRatio()
        }
      } else {
        this.imageTexture.needsUpdate = true
        if (this.uniforms.textureFactor.value.x === 0) this.calculateAspectRatio()
      }
    }

    // Updates the trackball controls
    this.controls.update()

    // Renders the scene
    this.effectComposer.render(this.uniforms.time)
  }
}

export default Playground
