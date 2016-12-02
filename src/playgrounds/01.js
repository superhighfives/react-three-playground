import { PerspectiveCamera, Scene,
         BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import TrackballControls from 'three-trackballcontrols'

class Playground {
  constructor (renderer) {
    // Update the renderer
    this.renderer = renderer
    this.renderer.setClearColor(0x00E8D5, 1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // Make a camera
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.z = 250

    // Make a scene, add the camera to it
    this.scene = new Scene()
    this.scene.add(this.camera)

    // Add a cube by making the shape, and the material,
    // and smooshing them together with a mesh
    const geometry = new BoxGeometry(100, 100, 100)
    const material = new MeshBasicMaterial({color: 0xffffff, wireframe: true, wireframeLinewidth: 2})
    this.cube = new Mesh(geometry, material)
    this.scene.add(this.cube)

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

    // Updates the trackball controls
    this.controls.update()

    // Renders the scene
    this.renderer.render(this.scene, this.camera)
  }
}

export default Playground
