import { PerspectiveCamera, Scene, PointLight,
         IcosahedronGeometry, Mesh, ShaderMaterial,
         PCFSoftShadowMap, PointLightHelper,
         Vector2 } from 'three'
import TrackballControls from 'three-trackballcontrols'
import { vertexShader, fragmentShader, uniforms } from '../shaders/polygons'
import EffectComposer, { RenderPass, ShaderPass, CopyShader } from 'three-effectcomposer-es6'
import * as TVShader from '../shaders/dots'
import * as GreyscaleShader from '../shaders/mirror'
import extend from 'extend'

class Playground {
  constructor (renderer, video) {
    this.renderer = renderer

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
    this.pointlight.position.set(0, 0, 100)
    this.pointlight.castShadow = true
    this.scene.add(this.pointlight)

    // Define an angle to animate the spotlight around
    this.pointlightOrbit = 2 * Math.PI / 180
    this.pointlightRadius = 250

    this.pointLightHelper = new PointLightHelper(this.pointlight)
    this.scene.add(this.pointLightHelper)

    // And something to cast shadows onto
    this.uniforms = extend(uniforms, {
      resolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)},
      time: {type: 'f', value: 0.0}
    })
    const planeGeometry = new IcosahedronGeometry(150, 0)
    const planeMaterial = new ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable'
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      lights: true
    })

    this.plane = new Mesh(planeGeometry, planeMaterial)
    this.plane.receiveShadow = true
    this.scene.add(this.plane)

    // Add controls so you can navigate the scene
    this.controls = new TrackballControls(this.camera, this.renderer.domElement)

    this.effectComposer = new EffectComposer(this.renderer)

    let renderPass = new RenderPass(this.scene, this.camera)
    this.effectComposer.addPass(renderPass)

    let greyscalePass = new ShaderPass(GreyscaleShader, 'texture')
    this.effectComposer.addPass(greyscalePass)

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
  loop () {
    // Update time uniform
    this.uniforms.time.value += 0.1
    // this.tvPass.uniforms.time.value += 0.01

    this.plane.rotation.x += 0.01

    this.pointlightOrbit += 2 * Math.PI / 180
    this.pointlight.position.x = this.pointlightRadius * Math.sin(this.pointlightOrbit)
    this.pointlight.position.y = this.pointlightRadius * Math.cos(this.pointlightOrbit)

    // Update the pointlight helper
    this.pointLightHelper.update()

    // Updates the trackball controls
    this.controls.update()

    // Renders the scene
    this.effectComposer.render(this.uniforms.time)
  }
}

export default Playground
