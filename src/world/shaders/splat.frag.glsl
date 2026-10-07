// 3D Gaussian splat rasteriser, fragment stage. Premultiplied alpha, back-to-front.
precision highp float;

uniform vec4 uLens;      // x, y (device px, origin bottom-left), radius, mode (0 off, 1 depth, 2 ellipsoids)
uniform float uModeAll;  // 0 off, 1 depth, 2 ellipsoids: applies to the whole view
uniform vec3 uPaper;
uniform vec3 uDeep;

in vec2 vP;
in vec4 vColor;
in vec3 vAlt;

out vec4 fragColor;

void main() {
  float r2 = dot(vP, vP);
  if (r2 > 4.0) discard;
  float g = exp(-r2);
  vec3 col = vColor.rgb;
  float a = vColor.a * g;

  float mode = uModeAll;
  float m = step(0.5, uModeAll);
  if (uLens.w > 0.5 && m < 0.5) {
    float dl = distance(gl_FragCoord.xy, uLens.xy);
    m = smoothstep(uLens.z, uLens.z - 1.5, dl);
    mode = uLens.w;
  }
  if (m > 0.0) {
    vec3 c2;
    float a2;
    if (mode < 1.5) {
      // depth: every Gaussian painted with its distance to the camera
      c2 = vAlt;
      a2 = min(1.0, vColor.a * 1.25) * g;
    } else {
      // raw ellipsoids: hard one-sigma discs with a shaded body and a paper rim
      float body = step(r2, 1.0) * step(0.03, vColor.a);
      float rim = smoothstep(0.72, 0.98, r2);
      c2 = mix(vColor.rgb * (0.62 + 0.38 * sqrt(max(0.0, 1.0 - r2))), uPaper, rim * 0.85);
      a2 = body * min(1.0, vColor.a * 1.6);
    }
    col = mix(col, c2, m);
    a = mix(a, a2, m);
  }
  if (a < 0.003) discard;
  fragColor = vec4(col * a, a);
}
