import { vec3, mat4, quat } from "pex-math";
import random from "pex-random";

import {
  ctx,
  gui,
  updateTime,
  updateBunny,
  depthPassCmd,
  drawFloorDepthCmd,
  drawBunnyDepthCmd,
  clearCmd,
  drawFloorCmd,
  drawBunnyCmd,
  drawFullscreenQuadCmd,
} from "./bunny.js";

const NUM_BUNNIES = 500;

const shadowBatches = [];
const batches = [];

random.seed(0);

for (let i = 0; i < NUM_BUNNIES; i++) {
  const m = mat4.create();
  mat4.translate(m, [
    random.float(-3, 3),
    random.float(0, 3),
    random.float(-3, 3),
  ]);
  mat4.mult(
    m,
    mat4.fromQuat(
      mat4.create(),
      quat.fromTo(quat.create(), [0, 0, 1], vec3.normalize(random.vec3()))
    )
  );
  mat4.scale(m, [0.2, 0.2, 0.2]);

  shadowBatches.push({
    uniforms: {
      uModelMatrix: m,
    },
  });
  batches.push({
    uniforms: {
      uModelMatrix: m,
      uDiffuseColor: [random.float(), random.float(), random.float(), 1.0],
    },
  });
}

ctx.frame(() => {
  updateTime();
  updateBunny(ctx);

  ctx.submit(depthPassCmd, () => {
    ctx.submit(drawFloorDepthCmd);
    ctx.submit(drawBunnyDepthCmd, shadowBatches);
  });
  ctx.submit(clearCmd, () => {
    ctx.submit(drawFloorCmd);
    ctx.submit(drawBunnyCmd, batches);
    ctx.submit(drawFullscreenQuadCmd);
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
