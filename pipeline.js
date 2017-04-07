const checkProps = require('./check-props')

const allowedProps = [
  'vert', 'frag', 'program',
  'depthEnabled', 'depthFunc',
  'blendEnabled', 'blendSrcRGBFactor', 'blendSrcAlphaFactor',
  'blendDstRGBFactor', 'blendDstAlphaFactor',
  'cullFaceEnabled', 'cullFace'
]

function createPipeline (ctx, opts) {
  checkProps(allowedProps, opts)

  const gl = ctx.gl

  const pipeline = Object.assign({
    class: 'pipeline',
    depthEnabled: false,
    depthFunc: ctx.DepthFunc.LessEqual
  }, opts)

  if (opts.vert && opts.frag) {
    pipeline.program = ctx.program({
      vert: opts.vert,
      frag: opts.frag
    })
  }

  if (pipeline.program && !pipeline.vertexLayout) {
    const attributesPerLocation = pipeline.program.attributesPerLocation
    pipeline.vertexLayout = Object.keys(attributesPerLocation).map((location) => {
      const attribute = attributesPerLocation[location]
      let size = 0
      return [attribute.name, parseInt(location, 10), attribute.size]
    })
  }

  return pipeline
}

module.exports = createPipeline
