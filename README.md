<a href="https://github.com/superhighfives/react-three-playground">
  <img alt="react-three-playgournd" src="./docs/assets/r3-logo.png" height="151px" />
</a>
<br />

# React + Three Playground

R3, or React and Three.js, is a series of playgrounds and demos highlighting many of the features and capabilities of WebGL. It covers simple objects, textures and lighting, all the way to custom shaders, framebuffers and video. It benefits from hot reloading, Webpack, and ES6 support out of the box.

It is set up to accept a single video, either by passing a video URL via the `video` query string (for example, [http://localhost:3000/?video=https://media.giphy.com/media/3o6Zti8Yz88sqW1nq0/giphy.mp4](http://localhost:3000/?video=https://media.giphy.com/media/3o6Zti8Yz88sqW1nq0/giphy.mp4)) or by using the `webcam` query string (with http://localhost:3000/?webcam=true). If neither are present, the app will fall back to using a video file, in `video/video.mp4`.

You can also see how React could be used in tandem with the Three.js canvas element, which can be activated with the `overlay` query string. [http://localhost:3000/?overlay=true](http://localhost:3000/?overlay=true).

## Getting started

To get started, clone the repo locally:

```
git clone git@github.com:superhighfives/react-three-playground.git
cd react-three-playground
npm install
```

Then, fire it up:

```
npm run start
```

## Playgrounds

To view different playgrounds, edit the `Playground` import in `App.js`. For example, to view Playground 01:

```
// App.js
import Playground from './playgrounds/01'
```

Though each playground showcases a different feature, shaders can be interchanged simply by changing the Shader variable that is imported. There is no need to change the settings / uniforms passed to the shaders. Unless you want to. In which case, go for it, you!

- [Playground 01](#playground-01) - Geometry
- [Playground 02](#playground-02) - Light And Shadow
- [Playground 03](#playground-03) - Video And Texture
- [Playground 04](#playground-04) - Single Shader
- [Playground 05](#playground-05) - Dual-Pass Shader
- [Playground 06](#playground-06) - Multi-Pass Shader
- [Shaders](#shaders)

---

## Playground 01
![An example of playground 01](./docs/assets/01.png)
### Geometry

```
// App.js
import Playground from './playgrounds/01'
```

- Navigable by mouse

A wireframe box, floating in space.

---

## Playground 02
![An example of playground 02](./docs/assets/02.png)
### Light And Shadow

```
// App.js
import Playground from './playgrounds/02'
```

- Navigable by mouse

A cube that accepts light and casts shadows.

---

## Playground 03
![An example of playground 03](./docs/assets/03.png)
### Video And Texture

```
// App.js
import Playground from './playgrounds/03'

// 03.js
import { vertexShader, fragmentShader, uniforms } from '../shaders/gradient' // Update for different shaders
```

- Navigable by mouse
- Accepts one shader
- Perspective camera

A shaded texture on a box geometry, floating in space, with a cube that accepts light.

---

## Playground 04
![An example of playground 04](./docs/assets/04.png)
### Single Shader

```
// App.js
import Playground from './playgrounds/04'

// 04.js
import { vertexShader, fragmentShader, uniforms } from '../shaders/gradient' // Update for different shaders
```

A flat display, with a single shader on a video texture.

- Accepts one shader
- Orthonographic camera

---

## Playground 05
![An example of playground 05](./docs/assets/05.png)
### Dual-Pass Shader

```
// App.js
import Playground from './playgrounds/05'

// 05.js
import * as BaseShader from '../shaders/dots' // First shader
import * as SecondaryShader from '../shaders/greyscale' // Second shader
```

A flat display, with a two shaders on a video texture.

- Accepts two shaders via a framebuffer
- Orthonographic Camera

---

## Playground 06
![An example of playground 06](./docs/assets/06.png)
### Multi-Pass Shader

```
// App.js
import Playground from './playgrounds/06'

// 06.js
import * as DotsShader from '../shaders/dots'
import * as MirrorShader from '../shaders/mirror'
import ShaderManager from '../tools/ShaderManager'

this.shaderManager = new ShaderManager(this.texture) // Constuct with your base texture
this.shaderManager.add(DotsShader) // Add shaders
this.shaderManager.add(MirrorShader) // Add shaders

// Add to render()
this.shaderManager.render()

// Use the texture and celebrate your success
const uniforms = { texture: {type: 't', value: this.shaderManager.texture()} }
```

A flat display, with as many shaders as you like, on a video texture.

- Accepts multiple shaders via a framebuffer using ShaderManager
- Orthonographic Camera

---

## Shaders

Playground 03 - 06 accept a shader. The following shaders are currently available:

- `shaders/base.js` Base (single colour)
- `shaders/dots.js` Dots
- `shaders/flip.js` Flip (horizontally)
- `shaders/glitch.js` Glitch
- `shaders/gradient.js` Gradient
- `shaders/greyscale.js` Greyscale
- `shaders/mirror.js` Mirror (mirror's texture horizontally)
- `shaders/texture.js` Texture (displays texture)
- `shaders/tv.js` TV (Old rolling TV)

---

## Why?
This repo was written for a workshop at Decompress 2016, in Melbourne, Australia.

## A note on React
Though this app is built on [Create React App](https://github.com/facebookincubator/create-react-app), it keeps a distinct line between React and Three. This allows for the benefits of React and Webpack without an overcomplicated architecture. There are many projects that support a more tightly integrated relationship between React and Three.js, like [React Three Renderer](https://github.com/toxicFork/react-three-renderer) and [React Three](https://github.com/Izzimach/react-three), and you should definetely check them out.

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent documentation for using create-react-app [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
