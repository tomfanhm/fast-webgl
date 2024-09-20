class Shader {
  private gl: WebGLRenderingContext
  private shader: WebGLShader

  constructor(gl: WebGLRenderingContext, type: number, source: string) {
    this.gl = gl
    this.shader = this.createShader(type, source)
  }

  /**
   * Creates and compiles a WebGL shader.
   *
   * @param type - The type of shader to create. This should be either `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`.
   * @param source - The GLSL source code for the shader.
   * @returns The compiled WebGLShader object.
   * @throws Will throw an error if the shader cannot be created or compiled.
   */
  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)
    if (!shader) {
      throw new Error("Error creating shader.")
    }

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader)
      this.gl.deleteShader(shader)
      throw new Error("Error compiling shader:" + info)
    }
    return shader
  }

  /**
   * Retrieves the compiled WebGL shader.
   *
   * @returns {WebGLShader} The compiled WebGL shader.
   */
  public getShader(): WebGLShader {
    return this.shader
  }

  /**
   * Disposes of the shader by deleting it from the WebGL context.
   * This method should be called to clean up resources when the shader is no longer needed.
   *
   * @remarks
   * This method deletes the shader from the WebGL context to free up GPU resources.
   */
  public dispose(): void {
    this.gl.deleteShader(this.shader)
  }
}

export default Shader
