module.exports = /* glsl */ `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec3 vNormal;
varying vec2 vTexCoord;

void main () {
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
  vTexCoord = aTexCoord;
}
`
