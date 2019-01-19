precision highp float;

#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
    vec3 direction;
    vec3 color;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
    };
    uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif
varying vec3 direction;
varying vec3 vertexWorldNormal;

attribute vec3 color;
attribute float alpha;

varying vec4 vertexColor;
varying vec2 vUv;

void main() {
  direction = directionalLights[0].direction;
  vertexWorldNormal = normalMatrix * normal;
  vUv = uv;
  vertexColor = vec4(color, alpha);
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
