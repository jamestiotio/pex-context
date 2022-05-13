import { checkProps } from "./utils.js";

const allowedProps = [
  "name",
  "framebuffer",
  "color",
  "depth",
  "clearColor",
  "clearDepth",
];

function createPass(ctx, opts) {
  checkProps(allowedProps, opts);

  const pass = {
    class: "pass",
    opts,
    clearColor: opts.clearColor,
    clearDepth: opts.clearDepth,
    _dispose() {
      this.opts = null;
      this.clearColor = null;
      this.clearDepth = null;
      if (this.framebuffer) {
        ctx.dispose(this.framebuffer);
        this.framebuffer = null;
      }
    },
  };

  // Inherits framebuffer from parent command or screen, if no target specified
  if (opts.color || opts.depth) pass.framebuffer = ctx.framebuffer(opts);

  return pass;
}

export default createPass;
