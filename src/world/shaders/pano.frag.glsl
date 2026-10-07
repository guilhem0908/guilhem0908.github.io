// The AIST set piece. One full-screen pass over the splat world:
//  - samples the real side-by-side video (left half raw 3DGS render, right half repaired),
//    each half a 2:1 equirectangular panorama
//  - morphs the projection from the camera's perspective view to the flat equirectangular
//    unwrap by interpolating directions in (longitude, latitude)
//  - repairs raw into clean behind a noisy "diffusion front"
precision highp float;

#define PI 3.141592653589793

uniform sampler2D tPano;
uniform vec2 uRes;
uniform float uAmt;      // 0..1 presence (iris)
uniform float uUnwrap;   // 0 perspective, 1 equirectangular
uniform float uWipe;     // 0 raw, 1 repaired
uniform float uYaw;      // camera heading (rad, 0 = +x, towards +z)
uniform float uPitch;
uniform float uTanHalf;  // tan(fov_y / 2)
uniform float uBand;     // half width of the unwrapped panorama in NDC
uniform float uBandY;    // vertical offset of the band centre in NDC
uniform float uTime;
uniform float uFlipY;
uniform vec2 uTex;       // size of the panorama texture in texels
uniform vec3 uDeep;
uniform vec3 uPaper;
uniform vec3 uFil;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// The panorama is 1024 texels for 360 degrees: seen from inside it is magnified several times.
// A cubic B-spline (four bilinear taps) keeps that magnification smooth instead of blocky.
vec4 cubic(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x, y = s.y - 4.0 * s.x, z = s.z - 4.0 * s.y + 6.0 * s.x;
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;
}

vec3 smoothTex(vec2 uv) {
  vec2 st = uv * uTex - 0.5;
  vec2 f = fract(st);
  st -= f;
  vec4 xc = cubic(f.x), yc = cubic(f.y);
  vec4 c = st.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 o = (c + vec4(xc.yw, yc.yw) / s) / uTex.xxyy;
  float sx = s.x / (s.x + s.y), sy = s.z / (s.z + s.w);
  return mix(mix(texture(tPano, o.yw).rgb, texture(tPano, o.xw).rgb, sx),
             mix(texture(tPano, o.yz).rgb, texture(tPano, o.xz).rgb, sx), sy);
}

vec3 pano(vec2 uv, float side) {
  // the label bar baked at the top of the video is skipped; the two halves must not bleed into each other
  float v = clamp(uv.y, 0.094, 0.996);
  float u = clamp(fract(uv.x), 0.003, 0.997) * 0.5 + side * 0.5;
  return smoothTex(vec2(u, mix(v, 1.0 - v, uFlipY)));
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float aspect = uRes.x / uRes.y;

  // perspective ray, pitched, in the yaw-local frame
  vec3 d = normalize(vec3(p.x * aspect * uTanHalf, p.y * uTanHalf, -1.0));
  float cp = cos(uPitch), sp = sin(uPitch);
  d = vec3(d.x, d.y * cp - d.z * sp, d.y * sp + d.z * cp);
  float lonP = atan(d.x, -d.z);
  float latP = asin(clamp(d.y, -1.0, 1.0));

  // flat equirectangular band, 2:1 in pixels
  float bandH = uBand * aspect * 0.5;
  vec2 q = vec2(p.x, p.y - uBandY * uUnwrap);
  float lonE = q.x / uBand * PI;
  float latE = q.y / bandH * (PI * 0.5);

  float t = uUnwrap * uUnwrap * (3.0 - 2.0 * uUnwrap);
  float lon = mix(lonP, lonE, t);
  float lat = mix(latP, latE, t);
  float edge = min(PI - abs(lon), (PI * 0.5 - abs(lat)) * 2.0);
  float inside = smoothstep(0.0, 0.012, edge);

  vec2 uv = vec2((lon + uYaw) / (2.0 * PI) + 0.5, 0.5 - lat / PI);
  // the rows under the label bar of the video do not exist: once unwrapped, the band stops there
  inside *= mix(1.0, smoothstep(0.094, 0.099, uv.y), t);

  // repair front: travels along the panorama, eaten by noise like a denoising step
  float wx = mix(vUv.x, q.x / uBand * 0.5 + 0.5, t);
  float n = vnoise(uv * vec2(90.0, 45.0) + uTime * 0.6) * 0.6 + vnoise(uv * vec2(22.0, 11.0) - uTime * 0.25) * 0.4;
  float front = uWipe * 1.3 - 0.15;
  float k = wx + (n - 0.5) * 0.11 - front;
  float rawMix = smoothstep(-0.012, 0.012, k);
  vec3 cRaw = pano(uv, 0.0);
  vec3 cFix = pano(uv, 1.0);
  vec3 c = mix(cFix, cRaw, rawMix);
  // inside the front the image is still noise
  float band = smoothstep(0.07, 0.0, abs(k)) * step(0.001, uWipe) * step(uWipe, 0.999);
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 91.7);
  c = mix(c, vec3(grain) * vec3(0.75, 0.8, 1.0) + cFix * 0.35, band * 0.55);
  float lineA = smoothstep(0.0035, 0.0, abs(wx - front)) * step(0.001, uWipe) * step(uWipe, 0.999);
  c = mix(c, uPaper, lineA * 0.9);

  // seen from inside, a little grain gives the magnified picture a surface
  c += (hash(gl_FragCoord.xy + fract(uTime * 0.37) * 53.1) - 0.5) * 0.05 * (1.0 - t);

  // graticule while the projection is in between
  float mid = sin(t * PI);
  float gl = smoothstep(0.012, 0.0, abs(fract(lon / (PI / 6.0) + 0.5) - 0.5) * (PI / 6.0));
  float gt = smoothstep(0.012, 0.0, abs(fract(lat / (PI / 6.0) + 0.5) - 0.5) * (PI / 6.0));
  c = mix(c, uPaper, max(gl, gt) * mid * 0.5);

  // stage behind the unwrapped band
  vec3 stage = uDeep;
  vec3 outc = mix(stage, c, inside);
  float stageA = mix(1.0, smoothstep(0.0, 0.6, t), 1.0 - inside);

  // iris from the centre of the view
  float r = length(vec2(p.x * aspect, p.y));
  float R = uAmt * (length(vec2(aspect, 1.0)) + 0.2);
  float iris = smoothstep(R, R - 0.14, r) * step(0.001, uAmt);
  float ring = smoothstep(0.02, 0.0, abs(r - R + 0.07)) * step(uAmt, 0.999) * step(0.001, uAmt);
  outc = mix(outc, uPaper, ring * 0.8);

  float a = iris * stageA;
  fragColor = vec4(outc * a, a);
}
