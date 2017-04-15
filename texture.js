const assert = require('assert')

function createTexture2D (ctx, opts) {
  const gl = ctx.gl

  // TODO: implement filtering options

  const texture = {
    class: 'texture2D',
    handle: gl.createTexture(),
    target: opts.target,
    width: 0,
    height: 0,
    _update: updateTexture2D
  }

  updateTexture2D(ctx, texture, opts)

  return texture
}

// opts = { src, width, height }
// opts = { data, width, height, format, flipY }
function updateTexture2D (ctx, texture, opts) {
  const gl = ctx.gl
  const PixelFormat = ctx.PixelFormat

  let data = null
  let width = 0
  let height = 0
  let lod = 0
  let internalFormat = gl.RGBA
  let format = gl.RGBA
  let type = gl.UNSIGNED_BYTE
  let flipY = opts.flipY || false
  let target = opts.target || texture.target

  gl.getExtension('WEBGL_depth_texture')

  const textureUnit = 0
  gl.activeTexture(gl.TEXTURE0 + textureUnit)
  gl.bindTexture(texture.target, texture.handle)
  // TODO: push state (current texture binding)

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, opts.wrap || gl.CLAMP_TO_EDGE)
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, opts.wrap || gl.CLAMP_TO_EDGE)

  // just an image
  // opts = HTMLImage

  // image with flags
  // opts = { data: HTMLImage, flipY: Boolean }

  // pixel data
  // opts = { data: Array, width: Number, height: Number, flipY: Boolean }

  // pixel data with flags
  // opts = { data: { data: Array, width: Number, height: Number }, flipY: Boolean },

  // array of images for cubemaps (and array textures in webgl2)
  // opts = { data: [ HTMLImage, ... ], width: Number, height: Number, flipY: Boolean }

  // array of pixel data for cubemaps (and array texture in webgl2)
  // opts = { data: [ { data: Array, width: Number, height: Number }, ..], flipY: Boolean }

  const img = opts.data ? opts.data : opts
  if (opts.nodeName || (opts.data && opts.data.nodeName)) {
    assert(img instanceof window.HTMLImageElement ||
      img instanceof window.HTMLCanvasElement,
      'Texture2D.update opts has to be Image, Canvas or Video element')
    // TODO: add support for HTMLVideoElement with videoWidth and videoHeight
    width = img.width
    height = img.height
    gl.texImage2D(target, lod, internalFormat, format, type, img)
  } else if (typeof opts === 'object') {
    assert(!data || Array.isArray(opts.data) ||
      opts.data instanceof Uint8Array ||
      opts.data instanceof Float32Array,
      'Texture2D.update opts.data has to be null or an Array, Uint8Array or Float32Array')

    data = opts.data.data || opts.data

    assert(opts.width && opts.height,
      'Texture2D.update opts.width and opts.height are required when providing opts.data')

    width = opts.width
    height = opts.height

    if (opts.format === PixelFormat.Depth) {
      format = gl.DEPTH_COMPONENT
      internalFormat = gl.DEPTH_COMPONENT
      type = gl.UNSIGNED_SHORT
    } else if (opts.format === PixelFormat.RGBA32F) {
      format = gl.RGBA
      internalFormat = gl.RGBA
      type = gl.FLOAT
    } else if (opts.format === PixelFormat.R32F) {
      format = gl.ALPHA
      internalFormat = gl.ALPHA
      type = gl.FLOAT
    } else if (opts.format) {
      assert.fail(`Unknown texture format: ${opts.format}`)
    }

    if (Array.isArray(data)) {
      if (type === gl.UNSIGNED_BYTE) {
        data = new Uint8Array(data)
      } else if (type === gl.FLOAT) {
        data = new Float32Array(data)
      }
    }

    gl.texImage2D(target, lod, internalFormat, width, height, 0, format, type, data)
  } else {
    // TODO: should i assert of throw new Error(msg)?
    assert.fail('Texture2D.update opts has to be a HTMLElement or Object')
  }

  texture.target = target
  texture.data = data
  texture.width = width
  texture.height = height
  texture.format = format
  texture.internalFormat = internalFormat
  texture.type = type
  return texture
}

module.exports = createTexture2D
