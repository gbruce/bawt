precision highp float;

attribute vec3 color;
attribute float alpha;

varying vec4 vertexColor;
varying vec2 vUv;

void main() {
  vUv = uv;
  vertexColor = vec4(color, alpha);
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
