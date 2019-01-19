varying vec2 vUv;
varying vec4 vertexColor;
varying vec3 direction;
varying vec3 vertexWorldNormal;

uniform sampler2D textures[4];
uniform int textureCount;
uniform vec3 ambientLight;
uniform vec3 diffuseLight;

vec4 applyDiffuseLighting(vec4 color) {
  float light = saturate(dot(vertexWorldNormal, -normalize(direction)));

  vec3 diffusion = diffuseLight.rgb * light;
  diffusion += ambientLight.rgb;
  diffusion = saturate(diffusion);

  color.rgb *= diffusion;

  return color;
}

void main() {
  vec4 color = texture2D(textures[0], vUv);
  gl_FragColor = applyDiffuseLighting(color * vertexColor);
}
