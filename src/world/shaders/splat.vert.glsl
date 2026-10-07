// 3D Gaussian splat rasteriser, vertex stage.
// One instanced quad per Gaussian; the 3D covariance is projected to screen space
// (EWA, Jacobian of the perspective projection) and the quad is aligned to its eigenvectors.
precision highp float;
precision highp int;
precision highp sampler2D;

#define TEX_W 1024
#define G_FAN 4

uniform sampler2D tCenter; // xyz, seed
uniform sampler2D tScale;  // xyz, birth
uniform sampler2D tQuat;
uniform sampler2D tColor;  // rgb, opacity
uniform sampler2D tAlt;    // alternate rgb (raw render) or path fraction
uniform sampler2D tMeta;   // kind, group, flags, room

uniform mat4 uView;
uniform mat4 uProj;
uniform vec2 uViewport;
uniform float uTime;
uniform float uTrain;
uniform vec3 uCloudC;
uniform vec3 uCloudS;
uniform float uPhoto;
uniform float uRepair;
uniform float uArtefact;
uniform float uCeil;
uniform float uPathS;
uniform float uPathLen;
uniform float uPathReveal;
uniform float uInvite;      // 0..1: pulses of light run forward along the planned path (before the first scroll)
uniform vec2 uThin;         // share of the surface Gaussians kept, and the size the rest takes to cover for them
uniform float uFogNear;
uniform float uFogFar;
uniform float uSensor;
uniform vec4 uSensorPose;   // x, z, dir.x, dir.z
uniform vec2 uSensorParams; // range (m), half opening (rad)
uniform float uDepthRange;
uniform vec4 uGroups[24];   // x, z, yaw, lift
uniform vec3 uDeep;
uniform vec3 uVoidDark;
uniform vec3 uAzure;
uniform vec3 uPaper;
uniform vec3 uFil;
uniform vec3 uCone;
uniform vec3 uFog;

in vec2 position;
in float aIndex;

out vec2 vP;
out vec4 vColor;
out vec3 vAlt;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec3 hash31(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

mat3 quatToMat(vec4 q) {
  float x = q.x, y = q.y, z = q.z, w = q.w;
  return mat3(
    1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z), 2.0 * (x * z - w * y),
    2.0 * (x * y - w * z), 1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
    2.0 * (x * z + w * y), 2.0 * (y * z - w * x), 1.0 - 2.0 * (x * x + y * y)
  );
}

// duotone print: deep -> blueprint -> azure -> paper
vec3 ramp(float l) {
  vec3 c = mix(uDeep, uVoidDark, smoothstep(0.0, 0.3, l));
  c = mix(c, uAzure, smoothstep(0.26, 0.62, l));
  c = mix(c, uPaper, smoothstep(0.56, 0.97, l));
  return c;
}

// Turbo colour map (Mikhailov, polynomial fit) for the depth lens
vec3 turbo(float x) {
  x = clamp(x, 0.0, 1.0);
  vec4 v4 = vec4(1.0, x, x * x, x * x * x);
  vec2 v2 = v4.zw * v4.z;
  return vec3(
    dot(v4, vec4(0.13572138, 4.61539260, -42.66032258, 132.13108234)) + dot(v2, vec2(-152.94239396, 59.28637943)),
    dot(v4, vec4(0.09140261, 2.19418839, 4.84296658, -14.18503333)) + dot(v2, vec2(4.27729857, 2.82956604)),
    dot(v4, vec4(0.10667330, 12.64194608, -60.58204836, 110.36276771)) + dot(v2, vec2(-89.90310912, 27.34824973))
  );
}

void cull() {
  gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
}

void main() {
  int i = int(aIndex + 0.5);
  ivec2 tc = ivec2(i % TEX_W, i / TEX_W);
  vec4 c0 = texelFetch(tCenter, tc, 0);
  vec4 s0 = texelFetch(tScale, tc, 0);
  vec4 q = texelFetch(tQuat, tc, 0);
  vec4 col = texelFetch(tColor, tc, 0);
  vec4 alt = texelFetch(tAlt, tc, 0);
  vec4 meta = texelFetch(tMeta, tc, 0);
  int kind = int(meta.r * 255.0 + 0.5);
  int grp = int(meta.g * 255.0 + 0.5);
  int flags = int(meta.b * 255.0 + 0.5);
  int room = int(meta.a * 255.0 + 0.5);
  float seed = c0.w;
  float birth = s0.w;

  vec3 pos = c0.xyz;
  vec3 scl = s0.xyz;
  mat3 R = quatToMat(q);
  float alpha = col.a;

  // moving groups: robots, ball, rig, sensor fan
  if (grp > 0) {
    vec4 g = uGroups[grp];
    if (grp == G_FAN) {
      float r = pos.x * uSensorParams.x;
      float a = pos.z * uSensorParams.y;
      pos = vec3(r * cos(a), pos.y, r * sin(a));
      alpha *= uSensor;
    }
    float cs = cos(g.z), sn = sin(g.z);
    mat3 Ry = mat3(cs, 0.0, sn, 0.0, 1.0, 0.0, -sn, 0.0, cs);
    pos = Ry * pos + vec3(g.x, g.w, g.y);
    R = Ry * R;
  }

  // floaters and needles of the raw render
  if (kind == 4) {
    float w = uTime * (0.25 + seed * 0.8) + seed * 40.0;
    pos += 0.16 * vec3(sin(w), cos(w * 1.3), sin(w * 0.7 + 1.0));
    float cs = cos(w * 0.6), sn = sin(w * 0.6);
    R = mat3(cs, 0.0, sn, 0.0, 1.0, 0.0, -sn, 0.0, cs) * R;
    float gone = smoothstep(seed * 0.7, seed * 0.7 + 0.3, 1.0 - uArtefact);
    alpha *= 1.0 - gone;
    scl *= mix(1.0, 0.1, gone);
  }
  if (kind == 5) {
    pos += 0.22 * vec3(sin(uTime * 0.11 + seed * 50.0), sin(uTime * 0.07 + seed * 31.0), cos(uTime * 0.09 + seed * 17.0));
  }
  if ((flags & 1) != 0) alpha *= uCeil;
  // quality governor, last resort: surfaces are tiled by fewer, slightly larger Gaussians
  if ((flags & 32) != 0 && uThin.x < 0.999) {
    alpha *= 1.0 - smoothstep(uThin.x - 0.06, uThin.x, seed);
    scl.xy *= uThin.y;
  }

  // colour of the settled Gaussian
  vec3 rgb;
  float lum = col.r;
  bool glow = (flags & 8) != 0;
  if (kind == 1) {
    vec3 photo = mix(alt.rgb, col.rgb, room == 3 ? uRepair : 1.0);
    float L = dot(photo, vec3(0.299, 0.587, 0.114));
    rgb = mix(ramp(L * 0.92 + 0.04), photo, uPhoto);
  } else if (kind == 2) {
    rgb = uFil * (0.72 + 0.28 * lum);
  } else if (kind == 3) {
    rgb = uCone * lum;
  } else if (kind == 4) {
    rgb = mix(col.rgb, uPaper, 0.08);
  } else {
    rgb = ramp(lum);
  }

  // the planned path: travelled part solid, the rest dashed
  if ((flags & 2) != 0) {
    float frac = (alt.r * 255.0 * 256.0 + alt.g * 255.0) / 65535.0;
    float ahead = step(uPathS, frac);
    float dash = step(0.5, fract(frac * uPathLen / 0.36));
    alpha *= mix(1.0, dash * 0.75, ahead);
    alpha *= step(frac, uPathReveal);
    float head = smoothstep(0.012, 0.0, abs(frac - uPathS));
    rgb = mix(rgb, uPaper, head * 0.85);
    scl.xy *= 1.0 + head * 0.8;
    // the invitation: a light leaves the camera every 2.4 m and runs down the path, its tail towards the visitor
    if (uInvite > 0.001) {
      float m = (frac - uPathS) * uPathLen;
      float w = fract(uTime * 0.62 - m / 2.4);
      float pulse = uInvite * exp(-w * 6.5) * smoothstep(0.15, 0.7, m) * (1.0 - smoothstep(5.5, 9.5, m)) * step(frac, uPathReveal);
      alpha = max(alpha, pulse * 0.98);
      rgb = mix(rgb, uPaper, pulse * 0.8);
      scl.xy *= 1.0 + pulse * 1.1;
    }
  }

  // cones lit by the field-of-view sensor model
  if ((flags & 4) != 0) {
    vec2 rel = pos.xz - uSensorPose.xy;
    float dist = length(rel);
    float ang = acos(clamp(dot(rel / max(dist, 1e-4), uSensorPose.zw), -1.0, 1.0));
    float lit = uSensor * smoothstep(uSensorParams.x, uSensorParams.x - 0.35, dist)
      * smoothstep(uSensorParams.y + 0.03, uSensorParams.y - 0.03, ang);
    if (kind == 3) rgb = mix(ramp(0.38 * lum + 0.05), uCone * (0.2 + 0.8 * lum), lit);
    else rgb = ramp(lum * mix(0.5, 1.0, lit));
    scl *= 1.0 + 0.12 * lit;
  }

  // training: random initialisation -> coarse cells -> densification
  if (uTrain < 0.999) {
    float t = uTrain;
    float p = clamp((t - birth) / 0.28, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 3.0);
    vec3 cell = (floor(pos / 1.25) + 0.5) * 1.25;
    vec3 jit = hash31(seed * 917.3 + 1.7) - 0.5;
    vec3 cloud = uCloudC + (hash31(seed * 331.1 + 4.2) - 0.5) * uCloudS;
    float e = smoothstep(0.0, 0.5, t);
    vec3 parent = mix(cloud, cell + jit * 0.7, e);
    pos = mix(parent, pos, p);
    float big = mix(0.3, 0.13, t) * (0.55 + hash11(seed * 7.1));
    scl = mix(vec3(big), scl, p);
    alpha *= smoothstep(birth - 0.001, birth + 0.035, t) * mix(0.42, 1.0, p);
    vec3 noisy = ramp(0.25 + 0.75 * hash11(seed * 53.7));
    rgb = mix(noisy, rgb, smoothstep(0.15, 1.0, p));
  }

  vec4 cam = uView * vec4(pos, 1.0);
  float depth = -cam.z;
  // a Gaussian about to touch the lens fades out instead of covering the screen
  alpha *= smoothstep(0.1, 0.34, depth);
  if (depth < 0.1 || alpha < 0.004) { cull(); return; }
  vec4 clip = uProj * cam;
  float lim = 1.4 * clip.w;
  if (abs(clip.x) > lim || abs(clip.y) > lim) { cull(); return; }

  // EWA projection of the 3D covariance
  mat3 M = R * mat3(scl.x, 0.0, 0.0, 0.0, scl.y, 0.0, 0.0, 0.0, scl.z);
  mat3 Sigma = M * transpose(M);
  float fx = uProj[0][0] * uViewport.x * 0.5;
  float fy = uProj[1][1] * uViewport.y * 0.5;
  float iz = 1.0 / depth;
  // clamp the tangent like the reference implementation to keep edge splats stable
  float tx = clamp(cam.x * iz, -1.6, 1.6);
  float ty = clamp(cam.y * iz, -1.6, 1.6);
  mat3 J = mat3(
    fx * iz, 0.0, 0.0,
    0.0, fy * iz, 0.0,
    fx * tx * iz, fy * ty * iz, 0.0
  );
  mat3 T = J * mat3(uView);
  mat3 cov = T * Sigma * transpose(T);
  float a0 = cov[0][0], b = cov[0][1], d0 = cov[1][1];
  float a = a0 + 0.3, d = d0 + 0.3;
  float det0 = max(1e-6, a0 * d0 - b * b);
  float det1 = max(1e-6, a * d - b * b);
  alpha *= sqrt(clamp(det0 / det1, 0.0, 1.0));
  float mid = 0.5 * (a + d);
  float rad = length(vec2(0.5 * (a - d), b));
  float l1 = mid + rad;
  float l2 = max(mid - rad, 0.08);
  vec2 dv = abs(b) < 1e-5 ? (a >= d ? vec2(1.0, 0.0) : vec2(0.0, 1.0)) : normalize(vec2(b, l1 - a));
  // no quad larger than the screen is tall
  float maxR = 0.25 * uViewport.y;
  vec2 major = min(sqrt(2.0 * l1), maxR) * dv;
  vec2 minor = min(sqrt(2.0 * l2), maxR) * vec2(-dv.y, dv.x);

  // fog to the ground colour
  float f = smoothstep(uFogNear, uFogFar, depth);
  if (!glow) rgb = mix(rgb, uFog, f * 0.94);
  else rgb = mix(rgb, uFog, f * 0.6);
  alpha *= 1.0 - smoothstep(uFogFar * 0.92, uFogFar * 1.12, depth);
  if (alpha < 0.004) { cull(); return; }

  vec2 ndc = clip.xy / clip.w;
  gl_Position = vec4(ndc + (position.x * major + position.y * minor) * 2.0 / uViewport, 0.0, 1.0);
  vP = position;
  vColor = vec4(rgb, alpha);
  vAlt = turbo(1.0 - clamp(log(max(depth, 0.5) / 0.5) / log(uDepthRange / 0.5), 0.0, 1.0));
}
