varying vec2 vUv;
varying vec4 vertexColor;

uniform sampler2D textures[4];
uniform int textureCount;

void main() {
  vec4 color = texture2D(textures[0], vUv);
  gl_FragColor = color * vertexColor;
}
