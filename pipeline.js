const checkProps = require('./check-props')

const allowedProps = [
  'vert', 'frag', 'program',
  'depthWrite', 'depthTest', 'depthFunc',
  'blend', 'blendSrcRGBFactor', 'blendSrcAlphaFactor',
  'blendDstRGBFactor', 'blendDstAlphaFactor',
  'cullFace', 'cullFaceMode',
  'colorMask',
  'primitive'
]

function createPipeline (ctx, opts) {
  checkProps(allowedProps, opts)

  const pipeline = Object.assign({
    class: 'pipeline',
    vert: null,
    frag: null,
    program: null,
    depthWrite: true,
    depthTest: false,
    depthFunc: ctx.DepthFunc.LessEqual,
    blend: false,
    blendSrcRGBFactor: ctx.BlendFactor.One,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.One,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
    cullFaceMode: ctx.Face.Back,
    colorMask: [true, true, true, true],
    primitive: ctx.Primitive.Triangles,
    _dispose: function () {
      this.vert = null
      this.frag = null
      if (this.program && --this.program.refCount === 0) {
        ctx.dispose(this.program)
      }
      this.program = null
    }
  }, opts)

  if (opts.vert && opts.frag) {
    pipeline.program = ctx.program({
      vert: opts.vert,
      frag: opts.frag
    })
  }

  if (pipeline.program && !pipeline.vertexLayout) {
    pipeline.program.refCount++
    const attributesPerLocation = pipeline.program.attributesPerLocation
    pipeline.vertexLayout = Object.keys(attributesPerLocation).map((location) => {
      const attribute = attributesPerLocation[location]
      return [attribute.name, parseInt(location, 10), attribute.size]
    })
  }

  return pipeline
}

module.exports = createPipeline
