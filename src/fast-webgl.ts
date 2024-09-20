import Shader from "./shader"
import Texture from "./texture"
import { TextureOptions, Uniform } from "./types"

type Params = {
  canvas: HTMLCanvasElement
  vertexSource: string
  fragmentSource: string
  textures?: {
    name: string
    source: string
    options?: TextureOptions
  }[]
  uniforms?: Uniform[]
  options?: {
    width?: number
    height?: number
  }
}

class FastWebGL {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private width: number
  private height: number
  private vertexShader: Shader
  private fragmentShader: Shader
  private program: WebGLProgram
  private textures: Texture[]
  private uniforms: Record<string, WebGLUniformLocation>
  private uniformValues: Record<string, number | number[]>
  private attribLocations: Record<string, number>
  private startTime: number

  constructor({ canvas, options = {}, vertexSource, fragmentSource, textures = [], uniforms = [] }: Params) {
    this.canvas = canvas
    this.gl = this.createContext()
    this.width = options.width ?? window.innerWidth
    this.height = options.height ?? window.innerHeight
    this.vertexShader = new Shader(this.gl, this.gl.VERTEX_SHADER, vertexSource)
    this.fragmentShader = new Shader(this.gl, this.gl.FRAGMENT_SHADER, fragmentSource)
    this.program = this.createProgram()
    this.textures = textures.map(
      ({ name, source, options }, i) =>
        new Texture({
          gl: this.gl,
          program: this.program,
          unit: i,
          name: name,
          source: source,
          options: options,
        }),
    )
    this.uniforms = {}
    this.uniformValues = {}
    this.attribLocations = {}
    this.startTime = performance.now()
    // Initialize
    this.gl.useProgram(this.program)
    this.setupAttributes()
    this.setUniforms(uniforms)
    this.resize(this.width, this.height)
    this.draw()
  }

  /**
   * Creates and returns a WebGL rendering context for the canvas.
   *
   * @returns {WebGLRenderingContext} The WebGL rendering context.
   * @throws {Error} If WebGL is not supported.
   */
  private createContext(): WebGLRenderingContext {
    const context = this.canvas.getContext("webgl")
    if (!context) {
      throw new Error("WebGL not supported.")
    }
    return context
  }

  /**
   * Retrieves the WebGL rendering context.
   *
   * @returns {WebGLRenderingContext} The WebGL rendering context associated with this instance.
   */
  public getContext(): WebGLRenderingContext {
    return this.gl
  }

  /**
   * Creates and links a WebGL program using the attached vertex and fragment shaders.
   * Validates the program after linking.
   *
   * @throws {Error} If the program cannot be created, linked, or validated.
   *
   * @returns {WebGLProgram} The created and linked WebGL program.
   */
  private createProgram(): WebGLProgram {
    const program = this.gl.createProgram()
    if (!program) throw new Error("Unable to create shader program.")
    this.gl.attachShader(program, this.vertexShader.getShader())
    this.gl.attachShader(program, this.fragmentShader.getShader())
    this.gl.linkProgram(program)
    this.gl.validateProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program)
      this.gl.deleteProgram(program)
      throw new Error("Error linking program: " + info)
    }

    if (!this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)) {
      const info = this.gl.getProgramInfoLog(program)
      console.warn("Error validating program: " + info)
    }
    return program
  }

  /**
   * Retrieves the current WebGL program.
   *
   * @returns {WebGLProgram} The WebGL program associated with this instance.
   */
  public getProgram(): WebGLProgram {
    return this.program
  }

  /**
   * Sets the uniforms for the WebGL program.
   *
   * @param uniforms - An array of uniform objects, each containing a `name` and `value`.
   *
   * This method iterates over the provided uniforms, retrieves their locations in the WebGL program,
   * and sets their values. If a uniform location is not found, it is skipped. The uniform locations
   * and values are stored in the `uniforms` and `uniformValues` properties respectively.
   */
  private setUniforms(uniforms: Uniform[]): void {
    uniforms.forEach((uniform) => {
      const { name, value } = uniform
      const location = this.gl.getUniformLocation(this.program, name)
      if (location === null) return
      this.uniforms[name] = location
      this.uniformValues[name] = value
      this.setUniformValue(location, value)
    })
  }

  /**
   * Sets the value of a WebGL uniform variable at the given location.
   *
   * @param location - The location of the uniform variable in the WebGL program.
   * @param value - The value to set for the uniform variable. This can be a single number or an array of numbers.
   *                - If the value is a number, it sets the uniform as a float.
   *                - If the value is an array, it sets the uniform based on the length of the array:
   *                  - Length 1: Sets the uniform as a float.
   *                  - Length 2: Sets the uniform as a vec2.
   *                  - Length 3: Sets the uniform as a vec3.
   *                  - Length 4: Sets the uniform as a vec4.
   */
  private setUniformValue(location: WebGLUniformLocation, value: unknown): void {
    if (typeof value === "number") {
      this.gl.uniform1f(location, value)
    } else if (Array.isArray(value)) {
      switch (value.length) {
        case 1:
          this.gl.uniform1f(location, value[0])
          break
        case 2:
          this.gl.uniform2f(location, value[0], value[1])
          break
        case 3:
          this.gl.uniform3f(location, value[0], value[1], value[2])
          break
        case 4:
          this.gl.uniform4f(location, value[0], value[1], value[2], value[3])
          break
        default:
          break
      }
    }
  }

  /**
   * Updates the value of a specified uniform variable and triggers a redraw.
   *
   * @param name - The name of the uniform variable to update.
   * @param value - The new value to set for the uniform variable. Can be a single number or an array of numbers.
   */
  public updateUniform(name: string, value: number | number[]): void {
    const location = this.uniforms[name]
    if (location) {
      this.uniformValues[name] = value
      this.setUniformValue(location, value)
      this.draw()
    }
  }

  /**
   * Sets up the attributes for the WebGL program.
   *
   * This method performs the following tasks:
   * 1. Retrieves the attribute location for "a_position" and stores it in `attribLocations`.
   * 2. Creates a buffer and binds it to the ARRAY_BUFFER target.
   * 3. Defines a rectangle using two triangles and uploads the positions to the buffer.
   * 4. Configures the attribute to pull data from the buffer.
   *
   * @throws {Error} If unable to create a buffer.
   */
  private setupAttributes() {
    const positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position")
    this.attribLocations["a_position"] = positionAttributeLocation
    const positionBuffer = this.gl.createBuffer()
    if (!positionBuffer) throw new Error("Unable to create buffer.")
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)

    // Set rectangle positions
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)

    // Set up how to pull out the data from the buffer
    this.gl.enableVertexAttribArray(positionAttributeLocation)
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0)
  }

  /**
   * Draws the current WebGL scene.
   *
   * This method sets the viewport to match the canvas dimensions, clears the canvas,
   * uses the specified WebGL program, and draws the arrays as triangles.
   *
   * @remarks
   * - The viewport is set to cover the entire canvas.
   * - The canvas is cleared with a transparent black color.
   * - The program used for drawing is set to the one specified in the `program` property.
   * - The method draws 6 vertices as triangles.
   */
  public draw() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.gl.useProgram(this.program)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
  }

  /**
   * Resizes the WebGL canvas and updates the viewport dimensions.
   *
   * @param width - The new width of the canvas.
   * @param height - The new height of the canvas.
   */
  public resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
    this.gl.viewport(0, 0, width, height)
  }

  /**
   * Calculates and returns the elapsed time in seconds since the start time.
   *
   * @returns {number} The elapsed time in seconds.
   */
  public getElapsedTime(): number {
    return (performance.now() - this.startTime) / 1000
  }

  /**
   * Disposes of the WebGL resources associated with this instance.
   * This includes deleting the WebGL program, disposing of the vertex and fragment shaders,
   * and disposing of all textures.
   *
   * @remarks
   * This method should be called to clean up resources when they are no longer needed
   * to avoid memory leaks.
   */
  public dispose(): void {
    this.gl.deleteProgram(this.program)
    this.vertexShader.dispose()
    this.fragmentShader.dispose()
    this.textures.forEach((texture) => texture.dispose())
  }
}

export default FastWebGL
