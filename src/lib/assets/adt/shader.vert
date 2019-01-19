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

attribute vec2 uvAlpha;

varying vec2 vUv;
varying vec2 vUvAlpha;

varying vec3 vertexNormal;
varying float cameraDistance;

void main() {
  direction = directionalLights[0].direction;
  vertexWorldNormal = normalMatrix * normal;

  vUv = uv;
  vUvAlpha = uvAlpha;

  // TODO: Potentially necessary for specular lighting
  vec3 vertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  cameraDistance = distance(cameraPosition, vertexWorldPosition);

  vertexNormal = vec3(normal);

  // TODO: Potentially unnecessary for ADT shading
  // vertexWorldNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
