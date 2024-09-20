# Fast-WebGL

`Fast-WebGL` is a simple and efficient WebGL wrapper designed to simplify working with WebGL shaders, textures, and uniforms. It abstracts the boilerplate setup and makes it easier to render graphics using shaders.

## Installation

Install dependencies:

```bash
npm install fast-webgl
```

## Usage

### Basic Setup

To use `FastWebGL`, you need to provide a canvas element, vertex and fragment shader source code, and optional textures and uniforms.

```javascript
// Example vertex shader source
const vertexSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Example fragment shader source
const fragmentSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  void main() {
    // Normalized coordinates
    vec2 st = gl_FragCoord.xy / u_resolution;
    // Gradient effect based on time and position
    gl_FragColor = vec4(st.x, st.y, abs(sin(u_time)), 1.0);
  }
`

// HTML Canvas element
const canvas = document.getElementById("webglCanvas")

// Initialize FastWebGL
const webgl = new FastWebGL({
  canvas,
  vertexSource,
  fragmentSource,
  textures: [],
  uniforms: [{ name: "u_time", value: 0.0 }],
  options: {
    width: 800,
    height: 600,
  },
})

// Animation loop to update time uniform
function render() {
  const time = webgl.getElapsedTime()
  webgl.updateUniform("u_time", time)
  webgl.draw()
  requestAnimationFrame(render)
}

// Start rendering
render()
```

### Parameters

When initializing `FastWebGL`, pass the following options:

```typescript
type Params = {
  canvas: HTMLCanvasElement // The canvas element for WebGL rendering
  vertexSource: string // GLSL vertex shader source code
  fragmentSource: string // GLSL fragment shader source code
  textures?: {
    // Optional textures
    name: string // Name of the texture uniform in the shader
    source: string // Path to the texture image
    options?: TextureOptions // Optional texture settings
  }[]
  uniforms?: Uniform[] // Optional list of uniforms for the shaders
  options?: {
    width?: number // Canvas width (default is the window's inner width)
    height?: number // Canvas height (default is the window's inner height)
  }
}
```

### Methods

- **`getContext(): WebGLRenderingContext`**  
  Returns the WebGL context associated with the canvas.
- **`getProgram(): WebGLProgram`**  
  Retrieves the compiled and linked WebGL program.
- **`updateUniform(name: string, value: number | number[])`**  
  Updates the value of a uniform variable in the shader.

- **`resize(width: number, height: number)`**  
  Resizes the canvas and updates the WebGL viewport.

- **`draw()`**  
  Draws the current WebGL scene.

- **`getElapsedTime(): number`**  
  Returns the elapsed time in seconds since the WebGL context was created.

- **`dispose()`**  
  Disposes of all WebGL resources, including shaders, textures, and the WebGL program.

### Textures and Uniforms

- **Textures** are passed as an array of objects. Each object should include the name of the texture uniform in the shader, the source of the texture (e.g., an image path), and optional texture settings.
- **Uniforms** are passed as an array of objects. Each object should include the name of the uniform and its initial value (which can be a single number or an array of numbers).

### Example with Textures and Uniforms

```javascript
const webgl = new FastWebGL({
  canvas,
  vertexSource,
  fragmentSource,
  textures: [
    {
      name: "u_texture",
      source: "texture.jpg",
    },
  ],
  uniforms: [
    { name: "u_time", value: 0.0 },
    { name: "u_resolution", value: [canvas.width, canvas.height] },
  ],
})
```

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change. Ensure to update tests as appropriate.

## License

This project is licensed under the MIT License.
