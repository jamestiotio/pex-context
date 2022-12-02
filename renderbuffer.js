/**
 * @typedef {import("./types.js").PexResource} RenderbufferOptions
 * @property {number} width
 * @property {number} height
 * @property {ctx.PixelFormat} [pixelFormat=ctx.PixelFormat.DEPTH_COMPONENT16] only `PixelFormat.DEPTH_COMPONENT16` is currently supported for use as render pass depth storage (e.g. `ctx.pass({ depth: renderbuffer })`) for platforms with no `WEBGL_depth_texture` support.
 */

function createRenderbuffer(ctx, opts) {
  const gl = ctx.gl;

  const renderbuffer = {
    class: "renderbuffer",
    handle: gl.createRenderbuffer(),
    target: gl.RENDERBUFFER,
    width: 0,
    height: 0,
    _update: updateRenderbuffer,
    _dispose() {
      gl.deleteRenderbuffer(this.handle);
      this.color = null;
      this.depth = null;
    },
  };

  updateRenderbuffer(ctx, renderbuffer, opts);

  return renderbuffer;
}

const FLOAT_FORMATS_MAP = {
  EXT_color_buffer_half_float: ["RGB16F", "RGBA16F"],
  WEBGL_color_buffer_float: ["RGB32F", "RGBA32F"],
  EXT_color_buffer_float: [
    "R16F",
    "RG16F",
    "RGBA16F",
    "R32F",
    "RG32F",
    "RGBA32F",
    "R11F_G11F_B10F",
  ],
};
const FLOAT_FORMATS_EXTS = Object.keys(FLOAT_FORMATS_MAP);
const FLOAT_FORMATS = Object.values(FLOAT_FORMATS_MAP).flat();

function updateRenderbuffer(ctx, renderbuffer, opts) {
  Object.assign(renderbuffer, opts);

  const gl = ctx.gl;

  if (FLOAT_FORMATS.includes(renderbuffer.pixelFormat)) {
    const suportedFormats = FLOAT_FORMATS_EXTS.map(
      (extension) =>
        !!gl.getExtension(extension) && FLOAT_FORMATS_MAP[extension]
    )
      .flat()
      // RGB32F and RGB16F are texture only
      .filter((format) => format && !["RGB16F", "RGB32F"].includes(format));

    console.assert(
      suportedFormats.includes(renderbuffer.pixelFormat),
      `Unsupported float renderable format ${renderbuffer.pixelFormat}`
    );
  }

  renderbuffer.format = gl[renderbuffer.pixelFormat];

  gl.bindRenderbuffer(renderbuffer.target, renderbuffer.handle);
  gl.renderbufferStorage(
    renderbuffer.target,
    renderbuffer.format,
    renderbuffer.width,
    renderbuffer.height
  );
  gl.bindRenderbuffer(renderbuffer.target, null);
}

export default createRenderbuffer;
