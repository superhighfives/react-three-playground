import { WebGLRenderer, PerspectiveCamera, Scene, SpotLight, SpotLightHelper,
         BoxGeometry, MeshPhongMaterial, Mesh,
         PCFSoftShadowMap } from 'three'
import TrackballControls from 'three-trackballcontrols'

class Playground {
  constructor (canvas) {
    // Make a renderer
    this.renderer = new WebGLRenderer({canvas: canvas, antialias: true})
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.shadowMap.enabled = true

    // Make a camera and position it off center
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.z = 500

    // Make a scene, add the camera to it
    this.scene = new Scene()
    this.scene.add(this.camera)

    // Add a cube by making the shape, and the material,
    // and smooshing them together with a mesh
    const cubeGeometry = new BoxGeometry(100, 100, 100)
    const cubeMaterial = new MeshPhongMaterial({color: 0xBE8010})
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
    this.spotlight.intensity = 1.25 // How intense it is
    this.spotlight.castShadow = true
    this.scene.add(this.spotlight)

    // Define an angle to animate the spotlight around
    this.spotlightOrbit = 2 * Math.PI / 180
    this.spotlightRadius = 100

    // This helper visualises the light
    this.spotLightHelper = new SpotLightHelper(this.spotlight)
    this.scene.add(this.spotLightHelper)

    // And something to cast shadows onto
    const planeGeometry = new BoxGeometry(5000, 5000, 5)
    const planeMaterial = new MeshPhongMaterial({color: 0xBE8010})
    this.plane = new Mesh(planeGeometry, planeMaterial)
    this.plane.position.z = -100
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
  loop () {
    // Rotate the cube
    this.cube.rotation.x += 0.001
    this.cube.rotation.y += 0.001
    this.cube.rotation.z += 0.001

    // Move the light about
    this.spotlightOrbit += 2 * Math.PI / 180
    this.spotlight.position.x = this.spotlightRadius * Math.sin(this.spotlightOrbit)
    this.spotlight.position.y = this.spotlightRadius * Math.cos(this.spotlightOrbit)

    // Updates the spotlight helper
    this.spotLightHelper.update()

    // Updates the trackball controls
    this.controls.update()

    // Renders the scene
    this.renderer.render(this.scene, this.camera)
  }
}

export default Playground
