function createFramebuffer (ctx, opts) {
  const gl = ctx.gl

  const framebuffer = {
    class: 'framebuffer',
    handle: gl.createFramebuffer(),
    target: gl.FRAMEBUFFER,
    drawBuffers: [],
    color: [],
    depth: null,
    width: 0,
    height: 0,
    refCount: 0,
    _update: updateFramebuffer,
    _dispose: function () {
      gl.deleteFramebuffer(this.handle)
      this.color = null
      this.depth = null
    }
  }

  if (opts.color || opts.depth) {
    updateFramebuffer(ctx, framebuffer, opts)
  }

  return framebuffer
}

// opts = { color: [texture] }
// opts = { color: [texture], depth }
// opts = { color: [{texture, target}], depth }
function updateFramebuffer (ctx, framebuffer, opts) {
  const gl = ctx.gl

  // TODO: if color.length > 1 check for WebGL2 or gl.getExtension('WEBGL_draw_buffers')
  framebuffer.color = opts.color.map((attachment) => {
    const colorAttachment = attachment.texture ? attachment : { texture: attachment }
    colorAttachment.level = 0 // we can't render to mipmap level other than 0 in webgl
    if (!colorAttachment.target) {
      colorAttachment.target = colorAttachment.texture.target
    }
    return colorAttachment
  })

  if (opts.depth && !opts.depth.texture) {
    opts.depth = { texture: opts.depth }
  }
  framebuffer.depth = opts.depth

  framebuffer.width = framebuffer.color[0].texture.width
  framebuffer.height = framebuffer.color[0].texture.height

  // TODO: ctx push framebuffer
  gl.bindFramebuffer(framebuffer.target, framebuffer.handle)

  framebuffer.drawBuffers.length = 0

  for (let i = 0; i < framebuffer.color.length; i++) {
    const colorAttachment = framebuffer.color[i]
    framebuffer.drawBuffers.push(gl.COLOR_ATTACHMENT0 + i)
    gl.framebufferTexture2D(framebuffer.target, gl.COLOR_ATTACHMENT0 + i,
       colorAttachment.target, colorAttachment.texture.handle, colorAttachment.level)
  }
  for (let i = framebuffer.color.length; i < ctx.capabilities.maxColorAttachments; i++) {
    gl.framebufferTexture2D(framebuffer.target, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0)
  }
  // console.log('fbo', gl.getError())
  // console.log('fbo', ctx.getGLString(gl, gl.checkFramebufferStatus(gl.FRAMEBUFFER)))

  if (framebuffer.depth) {
    if (ctx.debugMode) console.log('fbo attaching depth', framebuffer.depth)
    const depthAttachment = framebuffer.depth

    if (depthAttachment.texture.target) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
        depthAttachment.texture.target, depthAttachment.texture.handle, depthAttachment.level)
    } else {
      // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthAttachment.texture)
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthAttachment.texture.handle)
    }
  } else {
    if (ctx.debugMode) console.log('fbo deattaching depth')
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, null)
    gl.framebufferTexture2D(framebuffer.target, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, null, 0)
  }
  // console.log('fbo', gl.getError())
  // console.log('fbo', ctx.getGLString(gl, gl.checkFramebufferStatus(gl.FRAMEBUFFER)))
  var status = []
  status[gl.FRAMEBUFFER_COMPLETE] = 'FRAMEBUFFER_COMPLETE'
  status[gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT'
  status[gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT'
  status[gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS'
  status[gl.FRAMEBUFFER_UNSUPPORTED] = 'FRAMEBUFFER_UNSUPPORTED'
  // console.log('fbo status', status[gl.checkFramebufferStatus(gl.FRAMEBUFFER)])

  // TODO: ctx. pop framebuffer
  gl.bindFramebuffer(framebuffer.target, null)
}

module.exports = createFramebuffer
