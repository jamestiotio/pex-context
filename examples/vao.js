const createContext = require('../')
const createCube = require('primitive-cube')
const mat4 = require('pex-math/mat4')

const vaoVert = require('./shaders/vao.vert')
const vaoFrag = require('./shaders/vao.frag')

const W = 640
const H = 480
// const canvas = document.createElement('canvas')
// canvas.width = W
// canvas.height = H
// document.body.appendChild(canvas)
// const gl2 = canvas.getContext('webgl2')

const ctx = createContext({ width: W, height: H })
const cube = createCube()

window.ctx = ctx

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}


const vertexLayout = {
  aPosition: { location: 0, type: 'vec3' },
  aNormal: { location: 1, type: 'vec3' },
  aTexCoord: { location: 2, type: 'vec2' },
}

const drawCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    vertexLayout: vertexLayout,
    depthTest: true,
    vert: vaoVert,
    frag: vaoFrag
  }),
  vertexArray: ctx.vertexArray({
    vertexLayout: vertexLayout,
    attributes: {
      aPosition: ctx.vertexBuffer(cube.positions),
      aNormal: ctx.vertexBuffer(cube.normals),
      aTexCoord: ctx.vertexBuffer(cube.uvs)
    },
    indices: ctx.indexBuffer(cube.cells),
  }),
  uniforms: {
    uProjectionMatrix: mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      W / H,
      0.1,
      100
    ),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0])
  }
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd)
})

