const assert = require('assert')

function createVertexArray(ctx, opts) {
  const gl = ctx.gl

  const vertexArray = {
    class: 'vertexArray',
    handle: gl.createVertexArray(),
    ...opts   
  }

  updateVertexArray(ctx, vertexArray, opts.vertexLayout)

  return vertexArray
}

const typeToSize = {
  'float': 1,
  'vec2': 2,
  'vec3': 3,
  'vec4': 4,
  'mat3': 12,
  'mat4': 16
}

// opts = { attributes, indices }
function updateVertexArray(ctx, vertexArray, vertexLayout) {
  const gl = ctx.gl
  gl.bindVertexArray(vertexArray.handle)

  for (let i = 0; i < 16; i++) {
    ctx.state.activeAttributes[i] = null
    gl.disableVertexAttribArray(i)
  }

  // TODO: the same as i support [tex] and { texture: tex } i should support buffers in attributes?  
  const attributeNames = Object.keys(vertexArray.attributes)
  
  for (let i = 0; i < attributeNames.length; i++) {    
    const name = attributeNames[i]
    const attrib = vertexArray.attributes[name]
    // const location = (attrib.location !== undefined) ? attrib.location : i
    attrib.location = vertexLayout[name].location
    const location = attrib.location

    //TODO: that size comes from shader, can it come from buffer?
    const size = typeToSize[vertexLayout[name].type] //TODO: hardcoded vec4 size

    // const size = layout[2]

    // todo move that check to where we bind VAO
    // if (!attrib) {
    //   log(
    //     'Invalid command',
    //     cmd,
    //     "doesn't satisfy vertex layout",
    //     vertexLayout
    //   )
    //   assert.fail(
    //     `Command is missing attribute "${name}" at location ${location} with ${attrib}`
    //   )
    // }

    let buffer = attrib.buffer
    if (!buffer && attrib.class === 'vertexBuffer') {
      buffer = attrib
    }

    if (!buffer || !buffer.target) {
      log('Invalid vertexArray', vertexArray)
      assert.fail(
        `Trying to draw arrays with invalid buffer for attribute : ${name}`
      )
    }

    gl.bindBuffer(buffer.target, buffer.handle)
    if (size === 16) {
      gl.enableVertexAttribArray(location + 0)
      gl.enableVertexAttribArray(location + 1)
      gl.enableVertexAttribArray(location + 2)
      gl.enableVertexAttribArray(location + 3)
     
      // TODO: is this still valid?
      // we still check for buffer type because while e.g. pex-renderer would copy buffer type to attrib
      // a raw pex-context example probably would not
      gl.vertexAttribPointer(
        location,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 0
      )
      gl.vertexAttribPointer(
        location + 1,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 16
      )
      gl.vertexAttribPointer(
        location + 2,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 32
      )
      gl.vertexAttribPointer(
        location + 3,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 48
      )
      if (attrib.divisor) {
        gl.vertexAttribDivisor(location + 0, attrib.divisor)
        gl.vertexAttribDivisor(location + 1, attrib.divisor)
        gl.vertexAttribDivisor(location + 2, attrib.divisor)
        gl.vertexAttribDivisor(location + 3, attrib.divisor)
        instanced = true
      } else if (ctx.capabilities.instancing) {
        gl.vertexAttribDivisor(location + 0, 0)
        gl.vertexAttribDivisor(location + 1, 0)
        gl.vertexAttribDivisor(location + 2, 0)
        gl.vertexAttribDivisor(location + 3, 0)
      }
    } else {
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(
        location,
        size,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 0,
        attrib.offset || 0
      )
      if (attrib.divisor) {
        gl.vertexAttribDivisor(location, attrib.divisor)
      } else if (ctx.capabilities.instancing) {
        gl.vertexAttribDivisor(location, 0)
      }
    }
    // TODO: how to match index with vertexLayout location?
  }

  if (vertexArray.indices) {
    let indexBuffer = vertexArray.indices.buffer
    if (!indexBuffer && vertexArray.indices.class === 'indexBuffer') {
      indexBuffer = vertexArray.indices
    }
    if (!indexBuffer || !indexBuffer.target) {
      log('Invalid command', vertexArray)
      assert.fail(`Trying to draw arrays with invalid buffer for elements`)
    }
    gl.bindBuffer(indexBuffer.target, indexBuffer.handle)
  }
  
  gl.bindVertexArray(null)
}

module.exports = createVertexArray
