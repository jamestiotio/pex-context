const assert = require('assert')
const checkProps = require('./check-props')

const allowedProps = ['target', 'data', 'usage', 'type', 'offset']

let classNameByTarget = null

function createBuffer(ctx, opts) {
  const gl = ctx.gl

  if (!classNameByTarget) {
    classNameByTarget = {
      [gl.ARRAY_BUFFER]: 'vertexBuffer',
      [gl.ELEMENT_ARRAY_BUFFER]: 'indexBuffer',
      [gl.UNIFORM_BUFFER]: 'uniformBuffer'
    }
  }  
  checkProps(allowedProps, opts)
  assert(
    opts.target === gl.ARRAY_BUFFER || opts.target === gl.ELEMENT_ARRAY_BUFFER  || opts.target === gl.UNIFORM_BUFFER,
    'Invalid buffer target'
  )

  let className = classNameByTarget[opts.target]

  const buffer = {
    class: className,
    handle: gl.createBuffer(),
    target: opts.target,
    usage: opts.usage || gl.STATIC_DRAW,
    _update: updateBuffer,
    _dispose: function() {
      gl.deleteBuffer(this.handle)
      this.handle = null
    }
  }

  updateBuffer(ctx, buffer, opts)

  return buffer
}

function updateBuffer(ctx, buffer, opts) {
  checkProps(allowedProps, opts)

  const gl = ctx.gl
  let data = opts.data || opts
  let type = opts.type || buffer.type
  let offset = opts.offset

  if (Array.isArray(data)) {
    if (!type) {
      if (opts.target === gl.ARRAY_BUFFER) {
        type = ctx.DataType.Float32
      }      
      if (opts.target === gl.ELEMENT_ARRAY_BUFFER) {
        type = ctx.DataType.Uint16
      }
      if (opts.target === gl.UNIFORM_BUFFER) {
        type = ctx.DataType.Float32
      }
    }

    var sourceData = data
    var elemSize = Array.isArray(sourceData[0]) ? sourceData[0].length : 1
    var size = elemSize * sourceData.length

    if (type === ctx.DataType.Float32) {
      data = new Float32Array(elemSize === 1 ? sourceData : size)
    } else if (type === ctx.DataType.Uint8) {
      data = new Uint8Array(elemSize === 1 ? sourceData : size)
    } else if (type === ctx.DataType.Uint16) {
      data = new Uint16Array(elemSize === 1 ? sourceData : size)
    } else if (type === ctx.DataType.Uint32) {
      data = new Uint32Array(elemSize === 1 ? sourceData : size)
    }

    if (elemSize > 1) {
      for (var i = 0; i < sourceData.length; i++) {
        for (var j = 0; j < elemSize; j++) {
          var index = i * elemSize + j
          data[index] = sourceData[i][j]
        }
      }
    }
  } else if (data instanceof Float32Array) {
    type = ctx.DataType.Float32
  } else if (data instanceof Uint8Array) {
    type = ctx.DataType.Uint8
  } else if (data instanceof Uint16Array) {
    type = ctx.DataType.Uint16
  } else if (data instanceof Uint32Array) {
    type = ctx.DataType.Uint32
  } else if (data instanceof ArrayBuffer) {
    // assuming type was provided
  } else {
    throw new Error(`Unknown buffer data type: ${data.constructor}`)
  }

  buffer.type = type

  // TODO: is this a valid guess?
  buffer.length = data.length

  if (ctx.state.vertexArray) {
    ctx.state.vertexArray = undefined
    gl.bindVertexArray(null)
  }
  // TODO: push state, and pop as this can modify existing VBO?
  gl.bindBuffer(buffer.target, buffer.handle)
  if (!isNaN(offset)) {
    gl.bufferSubData(buffer.target, offset, data)
  } else {
    gl.bufferData(buffer.target, data, buffer.usage)
  }
}

module.exports = createBuffer
