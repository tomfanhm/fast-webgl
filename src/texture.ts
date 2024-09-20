import { TextureOptions } from "./types"

type TextureParams = {
  gl: WebGLRenderingContext
  program: WebGLProgram
  unit: number
  name: string
  source: string
  options?: TextureOptions
}

class Texture {
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private texture: WebGLTexture
  private unit: number
  private name: string
  private source: string
  private options: TextureOptions

  constructor(params: TextureParams) {
    this.gl = params.gl
    this.program = params.program
    this.unit = params.unit
    this.name = params.name
    this.source = params.source
    this.options = params.options ?? {}
    this.texture = this.createTexture()
    this.loadTexture()
  }

  /**
   * Creates a new WebGL texture.
   *
   * @returns {WebGLTexture} The created WebGL texture.
   * @throws {Error} If the WebGL texture creation fails.
   */
  private createTexture(): WebGLTexture {
    const texture = this.gl.createTexture()
    if (!texture) {
      throw new Error("Failed to create WebGL texture.")
    }
    return texture
  }

  /**
   * Loads a texture from an image source and sets it up for use in WebGL.
   *
   * This method creates an HTMLImageElement, sets its cross-origin attribute,
   * and assigns event handlers for the `onload` and `onerror` events. When the
   * image loads successfully, it binds the texture to the WebGL context, sets
   * texture parameters, and uploads the image to the GPU. If the image fails to
   * load, an error is thrown.
   *
   * @throws {Error} If the image fails to load.
   */
  private loadTexture(): void {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      this.gl.activeTexture(this.gl.TEXTURE0 + this.unit)
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.options.minFilter || this.gl.LINEAR)
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.options.magFilter || this.gl.LINEAR)
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.options.wrapS || this.gl.CLAMP_TO_EDGE)
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.options.wrapT || this.gl.CLAMP_TO_EDGE)
      const location = this.gl.getUniformLocation(this.program, this.name)
      this.gl.uniform1i(location, this.unit)
    }
    image.onerror = () => {
      throw new Error("Failed to load image: " + this.source)
    }
    image.src = this.source
  }

  /**
   * Retrieves the WebGL texture.
   *
   * @returns {WebGLTexture} The WebGL texture.
   */
  public getTexture(): WebGLTexture {
    return this.texture
  }

  /**
   * Disposes of the WebGL texture by deleting it from the WebGL context.
   * This method should be called to free up resources when the texture is no longer needed.
   *
   * @public
   */
  public dispose(): void {
    this.gl.deleteTexture(this.texture)
  }
}

export default Texture
