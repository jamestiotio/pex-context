const createContext = require('../')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const vec3 = require('pex-math/vec3')
const mat4 = require('pex-math/mat4')
const quat = require('pex-math/quat')
const random = require('pex-random')

const createCube = require('primitive-cube')
const SimplexNoise = require('simplex-noise')
const normals = require('normals')
const centerAndNormalize = require('geom-center-and-normalize')
const bunny = require('bunny')
const raf = require('raf')

const showNormalsVert = require('./shaders/show-normals.vert.js')
const showNormalsFrag = require('./shaders/show-normals.frag.js')
const shadowMappedVert = require('./shaders/shadow-mapped.vert.js')
const shadowMappedFrag = require('./shaders/shadow-mapped.frag.js')

const screenImageVert = require('./shaders/screen-image.vert')
const screenImageFrag = require('./shaders/screen-image.frag')

const ctx = createContext()

let elapsedSeconds = 0
let prevTime = Date.now()
const noise = new SimplexNoise()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [3, 0.5, 3],
  target: [0, 0, 0]
})

createOrbiter({ camera, distance: 10 })

const lightCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  near: 1,
  far: 50,
  position: [3, 14, 3],
  target: [0, 0, 0]
})

const depthMapSize = 1024
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.Depth,
  encoding: ctx.Encoding.Linear
})
const colorMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB
})

const depthPassCmd = {
  name: 'depthPass',
  pass: ctx.pass({
    color: [colorMap],
    depth: depthMap,
    clearColor: [1, 0, 0, 1],
    clearDepth: 1
  })
}

const drawPassCmd = {
  name: 'drawPass',
  pass: ctx.pass({
    clearColor: [1, 0, 0, 1],
    clearDepth: 1
  })
}

const floor = createCube(5, 0.1, 5)
const drawFloorCmd = {
  name: 'drawFloor',
  pipeline: ctx.pipeline({
    vert: shadowMappedVert,
    frag: shadowMappedFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uWrap: 0,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0, 0, 0, 1],
    uDiffuseColor: [1, 1, 1, 1]
  },
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(floor.positions)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(floor.normals)
    }
  },
  indices: {
    buffer: ctx.indexBuffer(floor.cells)
  }
}

const drawFloorDepthCmd = {
  name: 'drawFloorDepth',
  pipeline: ctx.pipeline({
    vert: showNormalsVert,
    frag: showNormalsFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: mat4.create()
  },
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(floor.positions)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(floor.normals)
    }
  },
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(floor.cells)
  }
}

const bunnyBaseVertices = centerAndNormalize(bunny.positions).map((p) =>
  vec3.scale(p, 2)
)
const bunnyBaseNormals = normals.vertexNormals(bunny.cells, bunny.positions)
const bunnyNoiseVertices = centerAndNormalize(bunny.positions).map((p) =>
  vec3.scale(p, 2)
)

const bunnyPositionBuffer = ctx.vertexBuffer(bunnyBaseVertices)
const bunnyNormalBuffer = ctx.vertexBuffer(bunnyBaseNormals)

const drawBunnyCmd = {
  name: 'drawBunny',
  pipeline: ctx.pipeline({
    vert: shadowMappedVert,
    frag: shadowMappedFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    // FIXME: because we pass by reference this matrix will keep updating without us
    // doing anything, is that but or a feature? Should i cache and force uViewMatrix: () => camera.viewMatrix
    // to mark the uniform as "dynamic" ?
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [0, 1, 0]),
    uWrap: 0,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0, 0, 0, 1],
    uDiffuseColor: [1, 1, 1, 1]
  },
  attributes: {
    aPosition: {
      buffer: bunnyPositionBuffer
    },
    aNormal: {
      buffer: bunnyNormalBuffer
    }
  },
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(bunny.cells)
  }
}

const drawBunnyDepthCmd = {
  name: 'drawBunnyDepth',
  pipeline: ctx.pipeline({
    vert: showNormalsVert,
    frag: showNormalsFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [0, 1, 0])
  },
  attributes: {
    aPosition: {
      buffer: bunnyPositionBuffer
    },
    aNormal: {
      buffer: bunnyNormalBuffer
    }
  },
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(bunny.cells)
  }
}

function updateTime() {
  const now = Date.now()
  const deltaTime = (now - prevTime) / 1000
  elapsedSeconds += deltaTime
  prevTime = now
}

function updateCamera() {
  const t = elapsedSeconds / 10
  const x = 6 * Math.cos(Math.PI * t)
  const y = 3
  const z = 6 * Math.sin(Math.PI * t)
  camera.set({ position: [x, y, z] })
}

function updateBunny(ctx) {
  const noiseFrequency = 1
  const noiseScale = 0.1
  for (let i = 0; i < bunnyBaseVertices.length; i++) {
    const v = bunnyNoiseVertices[i]
    const n = bunnyBaseNormals[i]
    vec3.set(v, bunnyBaseVertices[i])
    const f = noise.noise3D(
      v[0] * noiseFrequency,
      v[1] * noiseFrequency,
      v[2] * noiseFrequency + elapsedSeconds
    )
    v[0] += n[0] * noiseScale * (f + 1)
    v[1] += n[1] * noiseScale * (f + 1)
    v[2] += n[2] * noiseScale * (f + 1)
  }

  ctx.update(bunnyPositionBuffer, { data: bunnyNoiseVertices })

  // Update options:
  // 1) direct update buffer
  // bunnyPositionBuffer.bufferData(positionData)
  //
  // 2) direct update via ctx
  // ctx.update(bunnyPositionBuffer, { data: positionData })
  //
  // 3) update command
  // const updateCommand = ctx.update({ target: bunnyPositionBuffer, data: positionData })
  // ctx.submit(updatePositions)

  // FIXME: pre-allocate buffer
  // FIXME: add update command
  // What are the update patterns in other APIs?
  const normalData = normals.vertexNormals(bunny.cells, bunnyNoiseVertices)
  // bunnyNormalBuffer.bufferData(normalData)
  ctx.update(bunnyNormalBuffer, { data: normalData })
}

const drawFullscreenQuadCmd = {
  name: 'drawFullscreenQuad',
  pipeline: ctx.pipeline({
    vert: screenImageVert,
    frag: screenImageFrag,
    depthTest: false
  }),
  attributes: {
    // aPosition: { buffer: ctx.vertexBuffer(new Float32Array(R.flatten([[-1, -1], [1, -1], [1, 1], [-1, 1]]))) },
    aPosition: {
      buffer: ctx.vertexBuffer([
        [-1, -1],
        [-2 / 4, -1],
        [-2 / 4, -1 / 3],
        [-1, -1 / 3]
      ])
    },
    aTexCoord0: { buffer: ctx.vertexBuffer([[0, 0], [1, 0], [1, 1], [0, 1]]) }
  },
  indices: {
    buffer: ctx.indexBuffer([[0, 1, 2], [0, 2, 3]])
  },
  uniforms: {
    uTexture: depthMap
  }
}

const shadowBatches = []
const batches = []
const numBunnies = 500
for (let i = 0; i < numBunnies; i++) {
  const pos = [random.float(-5, 5), random.float(0, 5), random.float(-5, 5)]
  const color = [random.float(), random.float(), random.float(), 1.0]
  const m = mat4.create()
  mat4.translate(m, pos)
  mat4.mult(
    m,
    mat4.fromQuat(
      mat4.create(),
      quat.fromTo(quat.create(), [0, 0, 1], vec3.normalize(random.vec3()))
    )
  )
  mat4.scale(m, [0.2, 0.2, 0.2])

  shadowBatches.push({
    uniforms: {
      uModelMatrix: m
    }
  })
  batches.push({
    uniforms: {
      uModelMatrix: m,
      uDiffuseColor: color
    }
  })
}

// console.time('frame')
raf(function frame() {
  // console.timeEnd('frame')
  // console.time('frame')
  updateTime()
  updateCamera()
  updateBunny(ctx)
  // ctx.debug((++frameNumber) === 1)
  ctx.submit(depthPassCmd, () => {
    ctx.submit(drawFloorDepthCmd)
    ctx.submit(drawBunnyDepthCmd, shadowBatches)
  })
  ctx.submit(drawPassCmd, () => {
    ctx.submit(drawFloorCmd)
    ctx.submit(drawBunnyCmd, batches)
    ctx.submit(drawFullscreenQuadCmd)
  })

  window.dispatchEvent(new CustomEvent('pex-screenshot'))

  raf(frame)
})
