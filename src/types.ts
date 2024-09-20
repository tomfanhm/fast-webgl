export interface Uniform {
  name: string
  value: number | number[]
}

enum FilterMode {
  NEAREST = WebGLRenderingContext.NEAREST,
  LINEAR = WebGLRenderingContext.LINEAR,
  NEAREST_MIPMAP_NEAREST = WebGLRenderingContext.NEAREST_MIPMAP_NEAREST,
  LINEAR_MIPMAP_NEAREST = WebGLRenderingContext.LINEAR_MIPMAP_NEAREST,
  NEAREST_MIPMAP_LINEAR = WebGLRenderingContext.NEAREST_MIPMAP_LINEAR,
  LINEAR_MIPMAP_LINEAR = WebGLRenderingContext.LINEAR_MIPMAP_LINEAR,
}

enum WrapMode {
  CLAMP_TO_EDGE = WebGLRenderingContext.CLAMP_TO_EDGE,
  REPEAT = WebGLRenderingContext.REPEAT,
  MIRRORED_REPEAT = WebGLRenderingContext.MIRRORED_REPEAT,
}

export interface TextureOptions {
  minFilter?:
    | FilterMode.NEAREST
    | FilterMode.LINEAR
    | FilterMode.NEAREST_MIPMAP_NEAREST
    | FilterMode.LINEAR_MIPMAP_NEAREST
    | FilterMode.NEAREST_MIPMAP_LINEAR
    | FilterMode.LINEAR_MIPMAP_LINEAR
  magFilter?: FilterMode.NEAREST | FilterMode.LINEAR
  wrapS?: WrapMode
  wrapT?: WrapMode
}
