import './es.string.replace-fb144e2e.js';
import './esnext.iterator.map-e6a047df.js';
import './web.dom-collections.iterator-0e2ab85b.js';
import './esnext.iterator.for-each-ae5763c3.js';
import './iterate-3e898cf4.js';

/**
 * @typedef {number[]} oklab Cartesian form using D65 standard illuminant.
 *
 * Components range: 0 <= l <= 1; -0.233 <= a <= 0.276; -0.311 <= b <= 0.198;
 * @see {@link https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab}
 */

/**
 * @private
 */

function oklabToLinearSrgb(color, L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  color[0] = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  color[1] = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  color[2] = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return color;
}
/**
 * @private
 */

function linearSrgbToOklab(color, lr, lg, lb) {
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  color[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  color[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  color[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return color;
}
/**
 * Updates a color based on Oklab values and alpha.
 * @param {color} color
 * @param {number} l
 * @param {number} a
 * @param {number} b
 * @param {number} [α]
 * @return {color}
 */

function fromOklab(color, L, a, b, α) {
  oklabToLinearSrgb(color, L, a, b);
  color[0] = fromLinear(color[0]);
  color[1] = fromLinear(color[1]);
  color[2] = fromLinear(color[2]);
  return setAlpha(color, α);
}
/**
 * Returns an Oklab representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {oklab}
 */

function toOklab([r, g, b, a], out = []) {
  linearSrgbToOklab(out, toLinear(r), toLinear(g), toLinear(b));
  return setAlpha(out, a);
}

const setAlpha = (color, a) => {
  if (a !== undefined) color[3] = a;
  return color;
};
/**
 * Convert component from linear value
 * @param {number} c
 * @returns {number}
 */

const fromLinear = c => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
/**
 * Convert component to linear value
 * @param {number} c
 * @returns {number}
 */

const toLinear = c => c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
const floorArray = (color, precision = 5) => {
  const p = 10 ** precision;
  color.forEach((n, i) => color[i] = Math.floor((n + Number.EPSILON) * p) / p);
  return color;
};
const TMP = [0, 0, 0]; // HSLuv
// https://github.com/hsluv/hsluv/tree/master/haxe/src/hsluv

const L_EPSILON = 1e-10;
const m = [[3.240969941904521, -1.537383177570093, -0.498610760293], [-0.96924363628087, 1.87596750150772, 0.041555057407175], [0.055630079696993, -0.20397695888897, 1.056971514242878]];
const minv = [[0.41239079926595, 0.35758433938387, 0.18048078840183], [0.21263900587151, 0.71516867876775, 0.072192315360733], [0.019330818715591, 0.11919477979462, 0.95053215224966]];
const REF_U = 0.19783000664283;
const REF_V = 0.46831999493879;
const KAPPA = 9.032962962;
const EPSILON = 0.000088564516;

const yToL = Y => Y <= EPSILON ? Y * KAPPA : 1.16 * Y ** (1 / 3) - 0.16;

const lToY = L => L <= 0.08 ? L / KAPPA : ((L + 0.16) / 1.16) ** 3;

const xyzToLuv = ([X, Y, Z]) => {
  const divider = X + 15 * Y + 3 * Z;
  let varU = 4 * X;
  let varV = 9 * Y;

  if (divider !== 0) {
    varU /= divider;
    varV /= divider;
  } else {
    varU = NaN;
    varV = NaN;
  }

  const L = yToL(Y);
  if (L === 0) return [0, 0, 0];
  return [L, 13 * L * (varU - REF_U), 13 * L * (varV - REF_V)];
};
const luvToXyz = ([L, U, V]) => {
  if (L === 0) return [0, 0, 0];
  const varU = U / (13 * L) + REF_U;
  const varV = V / (13 * L) + REF_V;
  const Y = lToY(L);
  const X = 0 - 9 * Y * varU / ((varU - 4) * varV - varU * varV);
  return [X, Y, (9 * Y - 15 * varV * Y - varV * X) / (3 * varV)];
};
const luvToLch = ([L, U, V]) => {
  const C = Math.sqrt(U * U + V * V);
  let H;

  if (C < L_EPSILON) {
    H = 0;
  } else {
    H = Math.atan2(V, U) / (2 * Math.PI);
    if (H < 0) H = 1 + H;
  }

  return [L, C, H];
};
const lchToLuv = ([L, C, H]) => {
  const Hrad = H * 2 * Math.PI;
  return [L, Math.cos(Hrad) * C, Math.sin(Hrad) * C];
}; // TODO: normalize

const getBounds = L => {
  const result = [];
  const sub1 = (L + 16) ** 3 / 1560896;
  const sub2 = sub1 > EPSILON ? sub1 : L / KAPPA;
  let _g = 0;

  while (_g < 3) {
    const c = _g++;
    const m1 = m[c][0];
    const m2 = m[c][1];
    const m3 = m[c][2];
    let _g1 = 0;

    while (_g1 < 2) {
      const t = _g1++;
      const top1 = (284517 * m1 - 94839 * m3) * sub2;
      const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
      const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
      result.push({
        slope: top1 / bottom,
        intercept: top2 / bottom
      });
    }
  }

  return result;
}; // Okhsl/Okhsv
// https://github.com/bottosson/bottosson.github.io/blob/master/misc/colorpicker/colorconversion.js

const k1 = 0.206;
const k2 = 0.03;
const k3 = (1 + k1) / (1 + k2);
function toe(x) {
  return 0.5 * (k3 * x - k1 + Math.sqrt((k3 * x - k1) * (k3 * x - k1) + 4 * k2 * k3 * x));
}
function toeInv(x) {
  return (x * x + k1 * x) / (k3 * (x + k2));
}

function computeMaxSaturation(a, b) {
  let k0, k1, k2, k3, k4, wl, wm, ws;

  if (-1.88170328 * a - 0.80936493 * b > 1) {
    k0 = 1.19086277;
    k1 = 1.76576728;
    k2 = 0.59662641;
    k3 = 0.75515197;
    k4 = 0.56771245;
    wl = 4.0767416621;
    wm = -3.3077115913;
    ws = 0.2309699292;
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    k0 = 0.73956515;
    k1 = -0.45954404;
    k2 = 0.08285427;
    k3 = 0.1254107;
    k4 = 0.14503204;
    wl = -1.2684380046;
    wm = 2.6097574011;
    ws = -0.3413193965;
  } else {
    k0 = 1.35733652;
    k1 = -0.00915799;
    k2 = -1.1513021;
    k3 = -0.50559606;
    k4 = 0.00692167;
    wl = -0.0041960863;
    wm = -0.7034186147;
    ws = 1.707614701;
  }

  let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
  const kl = 0.3963377774 * a + 0.2158037573 * b;
  const km = -0.1055613458 * a - 0.0638541728 * b;
  const ks = -0.0894841775 * a - 1.291485548 * b;
  const l_ = 1 + S * kl;
  const m_ = 1 + S * km;
  const s_ = 1 + S * ks;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const ldS = 3 * kl * l_ * l_;
  const mdS = 3 * km * m_ * m_;
  const sdS = 3 * ks * s_ * s_;
  const ldS2 = 6 * kl * kl * l_;
  const mdS2 = 6 * km * km * m_;
  const sdS2 = 6 * ks * ks * s_;
  const f = wl * l + wm * m + ws * s;
  const f1 = wl * ldS + wm * mdS + ws * sdS;
  const f2 = wl * ldS2 + wm * mdS2 + ws * sdS2;
  S = S - f * f1 / (f1 * f1 - 0.5 * f * f2);
  return S;
}

function findCusp(a, b) {
  const sCusp = computeMaxSaturation(a, b);
  oklabToLinearSrgb(TMP, 1, sCusp * a, sCusp * b);
  const lCusp = Math.cbrt(1 / Math.max(TMP[0], TMP[1], TMP[2]));
  return [lCusp, lCusp * sCusp];
}
function getStMax(a_, b_, cusp = null) {
  if (!cusp) cusp = findCusp(a_, b_);
  return [cusp[1] / cusp[0], cusp[1] / (1 - cusp[0])];
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setAlpha: setAlpha,
  fromLinear: fromLinear,
  toLinear: toLinear,
  floorArray: floorArray,
  TMP: TMP,
  L_EPSILON: L_EPSILON,
  m: m,
  minv: minv,
  xyzToLuv: xyzToLuv,
  luvToXyz: luvToXyz,
  luvToLch: luvToLch,
  lchToLuv: lchToLuv,
  getBounds: getBounds,
  toe: toe,
  toeInv: toeInv,
  findCusp: findCusp,
  getStMax: getStMax
});

/**
 * @typedef {string} hex hexadecimal string (RGB[A] or RRGGBB[AA]).
 */

/**
 * Updates a color based on a hexadecimal string.
 * @param {color} color
 * @param {hex} hex Leading '#' is optional.
 * @return {color}
 */
function fromHex(color, hex) {
  hex = hex.replace(/^#/, "");
  let a = 1;

  if (hex.length === 8) {
    a = parseInt(hex.slice(6, 8), 16) / 255;
    hex = hex.slice(0, 6);
  } else if (hex.length === 4) {
    a = parseInt(hex.slice(3, 4).repeat(2), 16) / 255;
    hex = hex.slice(0, 3);
  }

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const num = parseInt(hex, 16);
  color[0] = (num >> 16 & 255) / 255;
  color[1] = (num >> 8 & 255) / 255;
  color[2] = (num & 255) / 255;
  if (color[3] !== undefined) color[3] = a;
  return color;
}
/**
 * Returns a hexadecimal string representation of a given color.
 * @param {color} color
 * @param {boolean} alpha Handle alpha
 * @return {hex}
 */

function toHex(color, alpha = true) {
  const c = color.map(val => Math.round(val * 255));
  return `#${(c[2] | c[1] << 8 | c[0] << 16 | 1 << 24).toString(16).slice(1).toUpperCase()}${alpha && color[3] !== undefined && color[3] !== 1 ? (c[3] | 1 << 8).toString(16).slice(1) : ""}`;
}

/**
 * @typedef {number[]} hsl hue, saturation, lightness.
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://en.wikipedia.org/wiki/HSL_and_HSV}
 */

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
/**
 * Updates a color based on HSL values and alpha.
 * @param {color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [a]
 * @return {color}
 */


function fromHSL(color, h, s, l, a) {
  if (s === 0) {
    color[0] = color[1] = color[2] = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    color[0] = hue2rgb(p, q, h + 1 / 3);
    color[1] = hue2rgb(p, q, h);
    color[2] = hue2rgb(p, q, h - 1 / 3);
  }

  return setAlpha(color, a);
}
/**
 * Returns a HSL representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {hsl}
 */

function toHSL([r, g, b, a], out = []) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  out[2] = (max + min) / 2;

  if (max === min) {
    out[0] = out[1] = 0; // achromatic
  } else {
    const d = max - min;
    out[1] = out[2] > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        out[0] = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        out[0] = (b - r) / d + 2;
        break;

      case b:
        out[0] = (r - g) / d + 4;
        break;
    }

    out[0] /= 6;
  }

  return setAlpha(out, a);
}

export { L_EPSILON as L, TMP as T, fromHSL as a, toHSL as b, minv as c, fromOklab as d, toe as e, fromLinear as f, getStMax as g, toeInv as h, findCusp as i, luvToXyz as j, lchToLuv as k, linearSrgbToOklab as l, m, luvToLch as n, oklabToLinearSrgb as o, getBounds as p, floorArray as q, fromHex as r, setAlpha as s, toLinear as t, utils as u, toHex as v, toOklab as w, xyzToLuv as x };
