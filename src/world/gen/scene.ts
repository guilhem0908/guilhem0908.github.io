// Procedural building. Everything is emitted as 3D Gaussians through Builder.
// Rooms: 1 lobby, 2 vestibule, 3 AIST (built from the real panorama), 4 TLSe hall,
// 5 factory hall, 6 Fil rouge room.

import { Builder, FLAG, KIND, basisQuat, cross, norm, anyPerp, type Sample, type V3 } from './builder';
import { AIST_C, CELLS, CROSS_Z, DOCKS, GROUP, LANE_HALF, LOOP, PEN, SCREEN, trackZ } from '../layout';

export interface Img {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

export interface GenInput {
  density: number;
  seed: number;
  pano: Img | null; // 2:1 x2 side by side: raw | repaired
  input: Img | null; // pinhole view cut out of the raw 3DGRUT panorama (tools/pinhole.py)
}

type Light = { p: V3; i: number; r: number };
type Shade = (p: V3, n: V3) => number;
interface Hole { a0: number; a1: number; b0: number; b1: number; window?: boolean }

const sstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function shade(lights: Light[], amb: number): Shade {
  return (p, n) => {
    let L = amb;
    for (const l of lights) {
      const dx = l.p[0] - p[0], dy = l.p[1] - p[1], dz = l.p[2] - p[2];
      const d = Math.hypot(dx, dy, dz) || 1;
      const lam = Math.max(0.18, Math.abs(dx * n[0] + dy * n[1] + dz * n[2]) / d);
      L += (l.i * lam) / (1 + (d / l.r) * (d / l.r));
    }
    return L;
  };
}

const GLOW: Sample = { l: 1, f: FLAG.GLOW, a: 0.95 };

function wall(
  B: Builder, x0: number, z0: number, x1: number, z1: number, h: number, sp: number,
  albedo: number, sh: Shade, holes: Hole[] = [], y0 = 0, frames = true,
) {
  const u: V3 = [x1 - x0, 0, z1 - z0];
  const uh = norm(u);
  const n = norm(cross(uh, [0, 1, 0]));
  B.surf([x0, y0, z0], u, [0, h - y0, 0], sp, (a, b, p) => {
    const y = b + y0;
    for (const k of holes) if (a > k.a0 && a < k.a1 && y > k.b0 && y < k.b1) return null;
    let l = albedo * sh(p, n);
    l *= 0.7 + 0.3 * Math.min(1, y / 0.55);
    if (y < 0.09) l *= 0.55;
    return { l };
  });
  // panel seams: thin dark needles on both faces
  const Lw = Math.hypot(u[0], u[2]);
  for (let a = 1.5; a < Lw - 0.4; a += 1.5) {
    let blocked = false;
    for (const k of holes) if (a > k.a0 - 0.12 && a < k.a1 + 0.12) blocked = true;
    if (blocked) continue;
    for (const sgn of [-1, 1]) {
      const bx = x0 + uh[0] * a + n[0] * 0.014 * sgn, bz = z0 + uh[2] * a + n[2] * 0.014 * sgn;
      B.line([bx, Math.max(0.1, y0), bz], [bx, h - 0.04, bz], 0.006, { l: albedo * 0.3, a: 0.8 }, { seg: 0.3 });
    }
  }
  if (!frames) return;
  for (const k of holes) {
    const P = (a: number, y: number): V3 => [x0 + uh[0] * a, Math.max(0, y), z0 + uh[2] * a];
    const w = 0.014;
    B.line(P(k.a0, k.b0), P(k.a0, k.b1), w, GLOW);
    B.line(P(k.a1, k.b0), P(k.a1, k.b1), w, GLOW);
    B.line(P(k.a0, k.b1), P(k.a1, k.b1), w, GLOW);
    if (k.window) {
      B.line(P(k.a0, k.b0), P(k.a1, k.b0), w, GLOW);
      const am = (k.a0 + k.a1) / 2, bm = (k.b0 + k.b1) / 2;
      B.line(P(am, k.b0), P(am, k.b1), 0.008, { l: 0.85 });
      B.line(P(k.a0, bm), P(k.a1, bm), 0.008, { l: 0.85 });
    }
  }
}

function floor(
  B: Builder, x0: number, z0: number, x1: number, z1: number, sp: number,
  alb: (p: V3) => number, sh: Shade, grid = 1, gridLum = 0.12,
) {
  const up: V3 = [0, 1, 0];
  B.surf([x0, 0, z0], [0, 0, z1 - z0], [x1 - x0, 0, 0], sp, (_a, _b, p) => {
    const d = Math.min(p[0] - x0, x1 - p[0], p[2] - z0, z1 - p[2]);
    const ao = 0.58 + 0.42 * sstep(0, 0.8, d);
    return { l: alb(p) * sh(p, up) * ao };
  });
  if (grid > 0) {
    for (let x = Math.ceil(x0 / grid) * grid; x < x1 - 0.01; x += grid) {
      if (x - x0 < 0.05) continue;
      B.line([x, 0.006, z0 + 0.05], [x, 0.006, z1 - 0.05], 0.009, { l: gridLum, a: 0.8 }, { flat: up, seg: 0.3 });
    }
    for (let z = Math.ceil(z0 / grid) * grid; z < z1 - 0.01; z += grid) {
      if (z - z0 < 0.05) continue;
      B.line([x0 + 0.05, 0.006, z], [x1 - 0.05, 0.006, z], 0.009, { l: gridLum, a: 0.8 }, { flat: up, seg: 0.3 });
    }
  }
}

function litBox(B: Builder, c: V3, size: V3, sp: number, top: number, side: number, sh: Shade, extra?: (face: number, p: V3, a: number, b: number) => Sample | null | undefined) {
  const normals: V3[] = [[0, 1, 0], [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0]];
  B.box(c, size, sp, (face, p, a, b) => {
    const e = extra?.(face, p, a, b);
    if (e !== undefined) return e;
    const alb = face === 0 ? top : side * (face === 2 || face === 4 ? 1 : 0.78);
    return { l: alb * sh(p, normals[face]) };
  });
}

// ---------------------------------------------------------------- lobby ---

function lobby(B: Builder) {
  B.room = 1;
  const H = 3.4;
  const lights: Light[] = [
    { p: [2.8, 2.75, 4.0], i: 0.75, r: 2.4 },
    { p: [5.2, 2.75, 4.0], i: 0.75, r: 2.4 },
    { p: [7.6, 2.75, 4.0], i: 0.8, r: 2.4 },
    { p: [1.9, 2.0, -0.4], i: 0.5, r: 3 },
    { p: [4.5, 2.0, -0.4], i: 0.5, r: 3 },
    { p: [7.1, 2.0, -0.4], i: 0.5, r: 3 },
    { p: [9.3, 1.3, 4.0], i: 0.8, r: 1.6 },
  ];
  const sh = shade(lights, 0.26);
  const wins: Hole[] = [1.2, 3.8, 6.4].map((a) => ({ a0: a, a1: a + 1.4, b0: 0.55, b1: 2.95, window: true }));

  const sun = (p: V3) => {
    for (const w of wins) {
      const xs = p[0] - 0.42 * p[2];
      if (p[2] > 0.35 && p[2] < 3.3 && xs > w.a0 + 0.05 && xs < w.a1 - 0.05) {
        const mx = (w.a0 + w.a1) / 2;
        if (Math.abs(xs - mx) < 0.035) return 1;
        return 3.4;
      }
    }
    return 1;
  };
  floor(B, 0, 0, 9, 8, 0.075, (p) => 0.2 * sun(p), sh, 1, 0.6);

  wall(B, 0, 0, 9, 0, H, 0.085, 0.4, sh, wins); // north, windows
  wall(B, 0, 0, 0, 8, H, 0.09, 0.38, sh); // west
  wall(B, 9, 0, 9, 8, H, 0.085, 0.42, sh, [{ a0: 3.4, a1: 4.6, b0: -1, b1: 2.3 }]); // east, door

  // colonnade framing the door
  for (const [cx, cz] of [[3.3, 2.1], [6.3, 2.1], [3.3, 6.3], [6.3, 6.3]] as [number, number][]) {
    B.cyl([cx, 0, cz], 0.2, 0.2, H, 0.06, (_ang, t, p, n) => ({ l: 0.56 * sh(p, n) * (0.7 + 0.3 * Math.min(1, t * 6)) }));
    B.cyl([cx, 0, cz], 0.27, 0.27, 0.12, 0.05, (_a, _t, p, n) => ({ l: 0.5 * sh(p, n) }));
  }
  // pendant lamps
  for (const x of [2.8, 5.2, 7.6]) {
    B.sphere([x, 2.75, 4.0], 0.15, 0.035, () => ({ l: 1, f: FLAG.GLOW }));
    B.line([x, 2.9, 4.0], [x, H + 0.4, 4.0], 0.005, { l: 0.8 });
  }
  // bench under the windows, counter behind the start pose
  litBox(B, [4.5, 0.23, 0.55], [5.6, 0.46, 0.5], 0.06, 0.62, 0.3, sh);
  litBox(B, [2.3, 0.48, 7.0], [2.6, 0.96, 0.8], 0.06, 0.7, 0.34, sh);

  // plinth + the rig: a sphere and 14 overlapping 110-degree views
  const R: V3 = [6.5, 0, 5.75];
  B.cyl(R, 0.24, 0.2, 0.86, 0.045, (_a, _t, p, n) => ({ l: 0.5 * sh(p, n) }));
  B.surf([R[0] - 0.2, 0.86, R[2] - 0.2], [0.4, 0, 0], [0, 0, 0.4], 0.05, (_a, _b, p) =>
    Math.hypot(p[0] - R[0], p[2] - R[2]) < 0.2 ? { l: 0.8 } : null);
  B.group = GROUP.RIG;
  B.sphere([0, 0, 0], 0.27, 0.026, (_p, n) => {
    const lat = Math.asin(n[1]), lon = Math.atan2(n[2], n[0]);
    const g = Math.min(Math.abs(Math.sin(lat * 6)), Math.abs(Math.sin(lon * 6)));
    return { l: g < 0.1 ? 0.25 : 0.96, f: FLAG.GLOW };
  });
  const tan55 = Math.tan((55 * Math.PI) / 180);
  for (let k = 0; k < 14; k++) {
    const t = (k + 0.5) / 14;
    const lat = (t - 0.5) * 2.3;
    const lon = t * Math.PI * 2 * 2.5;
    const d: V3 = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
    const right = anyPerp(d);
    const up = cross(d, right);
    const apex: V3 = [d[0] * 0.3, d[1] * 0.3, d[2] * 0.3];
    const depth = 0.2, hw = depth * tan55 * 0.8;
    const cen: V3 = [d[0] * (0.3 + depth), d[1] * (0.3 + depth), d[2] * (0.3 + depth)];
    const cs: V3[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [
      cen[0] + right[0] * hw * a + up[0] * hw * b,
      cen[1] + right[1] * hw * a + up[1] * hw * b,
      cen[2] + right[2] * hw * a + up[2] * hw * b,
    ]);
    for (let j = 0; j < 4; j++) {
      B.line(apex, cs[j], 0.004, { l: 0.9, f: FLAG.GLOW }, { seg: 0.07 });
      B.line(cs[j], cs[(j + 1) % 4], 0.005, { l: 1, f: FLAG.GLOW }, { seg: 0.07 });
    }
  }
  B.group = 0;
}

// ------------------------------------------------------------ vestibule ---

function vestibule(B: Builder, input: Img | null) {
  B.room = 2;
  const H = 3.0;
  const sh = shade([{ p: [10.5, 2.6, 4.0], i: 0.9, r: 2.2 }, { p: [10.5, 1.5, 2.2], i: 0.5, r: 1.6 }], 0.3);
  floor(B, 9, 1.5, 12, 6.5, 0.075, () => 0.28, sh, 1, 0.55);
  wall(B, 9, 1.5, 12, 1.5, H, 0.085, 0.58, sh);
  wall(B, 9, 6.5, 12, 6.5, H, 0.085, 0.58, sh);
  wall(B, 12, 1.5, 12, 6.5, H, 0.085, 0.62, sh, [{ a0: 1.9, a1: 3.1, b0: -1, b1: 2.3 }]);
  B.sphere([10.5, 2.6, 4.0], 0.13, 0.035, () => ({ l: 1, f: FLAG.GLOW }));

  // the input side of the story: a pinhole view of the raw 3DGRUT render, as a splat billboard on the north wall
  // (the source video is third-party footage and is never shown)
  if (input) {
    const w = 2.4, h = (w * input.h) / input.w;
    const o: V3 = [9.3, 2.15, 1.56];
    B.surf(o, [w, 0, 0], [0, -h, 0], 0.021, (a, b) => {
      const px = Math.min(input.w - 1, Math.floor((a / w) * input.w));
      const py = Math.min(input.h - 1, Math.floor((b / h) * input.h));
      const i = (py * input.w + px) * 4;
      return { c: [input.data[i], input.data[i + 1], input.data[i + 2]], k: KIND.PHOTO, a: 0.95 };
    }, 0.008);
    const z = o[2] + 0.01;
    const c: V3[] = [[o[0], o[1], z], [o[0] + w, o[1], z], [o[0] + w, o[1] - h, z], [o[0], o[1] - h, z]];
    for (let j = 0; j < 4; j++) B.line(c[j], c[(j + 1) % 4], 0.012, GLOW);
  }
}

// ----------------------------------------------------------------- AIST ---

function aist(B: Builder, pano: Img | null) {
  B.room = 3;
  const H = 2.9;
  const sh = shade([{ p: [16, 2.4, 4], i: 0.7, r: 3 }], 0.42);
  // outer shell (seen from outside and from above)
  wall(B, 12, 0, 20, 0, H, 0.1, 0.55, sh);
  wall(B, 20, 0, 20, 8, H, 0.1, 0.55, sh);
  wall(B, 12, 0, 12, 1.5, H, 0.1, 0.55, sh);
  wall(B, 12, 6.5, 12, 8, H, 0.1, 0.55, sh);

  const X0 = 12.08, X1 = 19.92, Z0 = 0.08, Z1 = 7.92, Y0 = 0.0, Y1 = 2.7;
  const [cx, cy, cz] = AIST_C;
  if (!pano) {
    floor(B, X0, Z0, X1, Z1, 0.08, () => 0.4, sh, 1);
    return;
  }
  const hw = pano.w / 2;
  const sample = (u: number, v: number, half: number): V3 => {
    const vv = Math.max(0.094, Math.min(0.995, v));
    const px = Math.min(hw - 1, Math.max(0, Math.floor(u * hw))) + half * hw;
    const py = Math.min(pano.h - 1, Math.floor(vv * pano.h));
    const i = (py * pano.w + px) * 4;
    return [pano.data[i], pano.data[i + 1], pano.data[i + 2]];
  };
  const nu = Math.round(452 * Math.sqrt(B.density)), nv = Math.round(nu / 2);
  const dth = (Math.PI * 2) / nu;
  for (let j = 0; j < nv; j++) {
    const lat0 = Math.PI / 2 - ((j + 0.5) / nv) * Math.PI;
    const cnt = Math.max(1, Math.round(nu * Math.cos(lat0)));
    for (let i = 0; i < cnt; i++) {
      const u = (i + B.rnd()) / cnt;
      const v = (j + B.rnd()) / nv;
      const lon = (u - 0.5) * Math.PI * 2;
      const lat = Math.PI / 2 - v * Math.PI;
      const d: V3 = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
      // ray / box
      let t = Infinity, face = 0;
      const tx = d[0] > 0 ? (X1 - cx) / d[0] : d[0] < 0 ? (X0 - cx) / d[0] : Infinity;
      const ty = d[1] > 0 ? (Y1 - cy) / d[1] : d[1] < 0 ? (Y0 - cy) / d[1] : Infinity;
      const tz = d[2] > 0 ? (Z1 - cz) / d[2] : d[2] < 0 ? (Z0 - cz) / d[2] : Infinity;
      if (tx < t) { t = tx; face = 0; }
      if (ty < t) { t = ty; face = 1; }
      if (tz < t) { t = tz; face = 2; }
      const p: V3 = [cx + d[0] * t, cy + d[1] * t, cz + d[2] * t];
      // door openings: west (entry) and south (exit)
      if (face === 0 && d[0] < 0 && p[2] > 3.4 && p[2] < 4.6 && p[1] < 2.3) continue;
      if (face === 2 && d[2] > 0 && p[0] > 16.4 && p[0] < 17.6 && p[1] < 2.3) continue;
      let n: V3, a: V3, b: V3;
      if (face === 0) { n = [1, 0, 0]; a = [0, 1, 0]; b = [0, 0, 1]; }
      else if (face === 1) { n = [0, 1, 0]; a = [0, 0, 1]; b = [1, 0, 0]; }
      else { n = [0, 0, 1]; a = [1, 0, 0]; b = [0, 1, 0]; }
      const cosInc = Math.max(0.3, Math.abs(d[0] * n[0] + d[1] * n[1] + d[2] * n[2]));
      const s = (t * dth * 0.6) / Math.sqrt(cosInc);
      const ang = B.rnd() * Math.PI, ca = Math.cos(ang), sa = Math.sin(ang);
      const ru: V3 = [a[0] * ca + b[0] * sa, a[1] * ca + b[1] * sa, a[2] * ca + b[2] * sa];
      const rv: V3 = [-a[0] * sa + b[0] * ca, -a[1] * sa + b[1] * ca, -a[2] * sa + b[2] * ca];
      const clean = sample(u, v, 1), raw = sample(u, v, 0);
      const flags = face === 1 && d[1] > 0 ? FLAG.CEIL : 0;
      B.push(p, [s * (0.85 + 0.4 * B.rnd()), s * (0.85 + 0.4 * B.rnd()), 0.01], basisQuat(ru, rv, n),
        clean[0], clean[1], clean[2], 0.94, KIND.PHOTO, flags, raw[0], raw[1], raw[2]);
    }
  }
  // door frames
  B.line([X0, 0, 3.4], [X0, 2.3, 3.4], 0.014, GLOW); B.line([X0, 0, 4.6], [X0, 2.3, 4.6], 0.014, GLOW);
  B.line([X0, 2.3, 3.4], [X0, 2.3, 4.6], 0.014, GLOW);
  B.line([16.4, 0, Z1], [16.4, 2.3, Z1], 0.014, GLOW); B.line([17.6, 0, Z1], [17.6, 2.3, Z1], 0.014, GLOW);
  B.line([16.4, 2.3, Z1], [17.6, 2.3, Z1], 0.014, GLOW);

  // what the raw render is full of: needles and floaters, coloured from the raw frame itself
  const cnt = Math.round(1700 * B.density);
  for (let i = 0; i < cnt; i++) {
    const r = 1.25 + Math.pow(B.rnd(), 0.8) * 2.5;
    const lon = (B.rnd() - 0.5) * Math.PI * (B.rnd() < 0.7 ? 1.1 : 2);
    const y = 0.15 + B.rnd() * 2.4;
    const p: V3 = [cx + Math.cos(lon) * r, y, cz + Math.sin(lon) * r];
    if (p[0] < X0 + 0.2 || p[0] > X1 - 0.2 || p[2] < Z0 + 0.2 || p[2] > Z1 - 0.2) continue;
    const dir = norm([B.rnd() - 0.5, (B.rnd() - 0.5) * 0.7, B.rnd() - 0.5]);
    const side = anyPerp(dir);
    const needle = B.rnd() < 0.72;
    const L = needle ? 0.1 + B.rnd() * 0.42 : 0.03 + B.rnd() * 0.07;
    const w = needle ? 0.003 + B.rnd() * 0.006 : L * (0.5 + B.rnd() * 0.5);
    const c = sample(0.3 + B.rnd() * 0.4, 0.2 + B.rnd() * 0.75, 0);
    const boost = 1.25;
    B.push(p, [L, w, w], basisQuat(dir, side, cross(dir, side)),
      Math.min(255, c[0] * boost), Math.min(255, c[1] * boost), Math.min(255, c[2] * boost),
      0.55 + B.rnd() * 0.4, KIND.ARTEFACT, 0);
  }
}

// ----------------------------------------------------------------- TLSe ---

export interface Cone { x: number; z: number; side: number }

function tlse(B: Builder): Cone[] {
  B.room = 4;
  const H = 3.4;
  const lights: Light[] = [3, 7, 11, 15, 19].map((x) => ({ p: [x, 3.1, 10.5] as V3, i: 0.9, r: 2.3 }));
  const sh = shade(lights, 0.3);
  floor(B, 0, 8, 20, 13, 0.085, () => 0.17, sh, 0);
  wall(B, 0, 8, 20, 8, H, 0.09, 0.4, sh, [{ a0: 16.4, a1: 17.6, b0: -1, b1: 2.3 }]);
  wall(B, 0, 13, 20, 13, H, 0.09, 0.4, sh, [{ a0: 1.9, a1: 3.1, b0: -1, b1: 2.3 }]);
  wall(B, 0, 8, 0, 13, H, 0.1, 0.4, sh);
  wall(B, 20, 8, 20, 13, H, 0.1, 0.4, sh);
  for (const l of lights) B.line([l.p[0] - 0.9, 3.15, 10.5], [l.p[0] + 0.9, 3.15, 10.5], 0.02, GLOW);

  const up: V3 = [0, 1, 0];
  // track edges
  for (const off of [-1.72, 1.72]) {
    let prev: V3 | null = null;
    for (let x = 16.6; x >= 3.2; x -= 0.25) {
      const p: V3 = [x, 0.008, trackZ(x) + off];
      if (prev) B.line(prev, p, 0.022, { l: 0.7, a: 0.9 }, { flat: up, seg: 0.25 });
      prev = p;
    }
  }
  // start line
  for (let i = 0; i < 14; i++) for (let j = 0; j < 2; j++) {
    if ((i + j) % 2) continue;
    const z = trackZ(16.4) - 1.6 + i * 0.23, x = 16.4 + j * 0.23;
    B.surf([x, 0.008, z], [0.23, 0, 0], [0, 0, 0.23], 0.06, () => ({ l: 0.95 }));
  }

  const cones: Cone[] = [];
  const cone = (x: number, z: number, side: number) => {
    cones.push({ x, z, side });
    const tagK = side > 0 ? KIND.STRUCT : KIND.CONE;
    const body = (t: number): Sample => {
      const band = t > 0.42 && t < 0.66;
      return { l: band ? (side > 0 ? 0.16 : 0.1) : side > 0 ? 0.95 : 1.0, k: tagK, f: FLAG.TAG, a: 0.96 };
    };
    B.surf([x - 0.115, 0.02, z - 0.115], [0.23, 0, 0], [0, 0, 0.23], 0.035, () => body(0));
    B.cyl([x, 0.02, z], 0.082, 0.022, 0.32, 0.024, (_a, t) => body(t));
  };
  for (let x = 16.1; x >= 4.6; x -= 1.56) {
    const zc = trackZ(x);
    cone(x, zc + 1.42, 1); // left of the driving direction: blue row
    cone(x, zc - 1.42, -1); // right: yellow row
  }
  // the last bend, towards the factory door
  for (const [x, z] of [[2.9, 9.7], [1.6, 10.2], [1.0, 11.2], [1.1, 12.3]]) cone(x, z, -1);
  for (const [x, z] of [[4.3, 12.35], [3.75, 12.75]]) cone(x, z, 1);
  return cones;
}

// -------------------------------------------------------------- factory ---
// An illustration of a smart-factory floor: one-way lanes, workstations with an arm each,
// docking pads, racking, a conveyor, and a fleet of mobile robots (animated in world/index.ts).

function factory(B: Builder) {
  B.room = 5;
  const H = 6.3;
  const lp: [number, number][] = [[4.5, 16.2], [8.3, 16.2], [12.2, 16.2], [12.2, 19.7], [12.2, 23.2], [8.3, 23.2], [4.5, 23.2], [4.5, 19.7], [8.3, 19.7], [2.4, 14.4]];
  const lights: Light[] = lp.map(([x, z]) => ({ p: [x, 5.6, z] as V3, i: 1.15, r: 3.0 }));
  const sh = shade(lights, 0.2);
  const wins: Hole[] = [1.6, 5.0, 8.4].map((a) => ({ a0: a, a1: a + 2.2, b0: 3.9, b1: 5.6, window: true }));
  const sun = (p: V3) => {
    for (const w of wins) {
      const zs = p[2] - 13 - 0.25 * p[0];
      if (p[0] > 1.3 && p[0] < 4.3 && zs > w.a0 && zs < w.a1) return 1.9;
    }
    return 1;
  };
  const [la, lb, lc] = LOOP;
  const inLane = (p: V3) => {
    const x = p[0], z = p[2], h = LANE_HALF;
    const inX = x > la[0] - h && x < lb[0] + h, inZ = z > la[1] - h && z < lc[1] + h;
    if (inX && inZ && (Math.abs(z - la[1]) < h || Math.abs(z - lc[1]) < h || Math.abs(x - la[0]) < h || Math.abs(x - lb[0]) < h || Math.abs(z - CROSS_Z) < h)) return true;
    return x > lb[0] && x < 14 && Math.abs(z - 19.6) < h;
  };
  floor(B, 0, 13, 14, 25, 0.085, (p) => 0.2 * sun(p) * (inLane(p) ? 1.75 : 1), sh, 2, 0.34);
  wall(B, 0, 13, 0, 25, 3.4, 0.095, 0.36, sh);
  wall(B, 0, 13, 0, 25, H, 0.15, 0.34, sh, wins, 3.4);
  wall(B, 0, 25, 14, 25, 3.4, 0.095, 0.36, sh);
  wall(B, 0, 25, 14, 25, H, 0.15, 0.34, sh, [], 3.4);
  wall(B, 14, 13, 14, 25, 3.4, 0.095, 0.36, sh, [{ a0: 6.0, a1: 7.2, b0: -1, b1: 2.3 }]);
  wall(B, 14, 13, 14, 25, H, 0.15, 0.34, sh, [], 3.4);
  wall(B, 0, 13, 14, 13, H, 0.15, 0.34, sh, [], 3.4);
  // trusses and light strips
  for (const z of [14.6, 17.9, 21.4, 24.4]) {
    B.line([0, H, z], [14, H, z], 0.022, { l: 0.6 }, { seg: 0.3 });
    for (let x = 1; x < 14; x += 2) B.line([x, H, z], [x + 1, H - 0.5, z], 0.012, { l: 0.5 }, { seg: 0.3 });
    for (let x = 2; x < 14; x += 2) B.line([x, H - 0.5, z], [x, H, z], 0.012, { l: 0.5 }, { seg: 0.3 });
    B.line([0, H - 0.5, z], [14, H - 0.5, z], 0.016, { l: 0.55 }, { seg: 0.3 });
  }
  for (const [x, z] of lp) B.line([x - 0.7, H - 0.52, z], [x + 0.7, H - 0.52, z], 0.03, GLOW);

  // ---- lane paint
  const up: V3 = [0, 1, 0];
  const paint: Sample = { l: 1, k: KIND.CONE, a: 0.92 };
  const y = 0.01, h = LANE_HALF;
  const [a, b, c, d] = LOOP;
  const P = (x: number, z: number): V3 => [x, y, z];
  const stripe = (p0: V3, p1: V3) => B.line(p0, p1, 0.028, paint, { flat: up, seg: 0.22 });
  // outer edge of the loop
  stripe(P(a[0] - h, a[1] - h), P(b[0] + h, b[1] - h));
  stripe(P(b[0] + h, b[1] - h), P(b[0] + h, 19.6 - h)); // gap: the way out to the next room
  stripe(P(b[0] + h, 19.6 + h), P(c[0] + h, c[1] + h));
  stripe(P(c[0] + h, c[1] + h), P(d[0] - h, d[1] + h));
  stripe(P(d[0] - h, d[1] + h), P(a[0] - h, a[1] - h));
  stripe(P(b[0] + h, 19.6 - h), P(14, 19.6 - h));
  stripe(P(b[0] + h, 19.6 + h), P(14, 19.6 + h));
  // inner edge, open where the cross aisle joins
  stripe(P(a[0] + h, a[1] + h), P(b[0] - h, b[1] + h));
  stripe(P(d[0] + h, d[1] - h), P(c[0] - h, c[1] - h));
  for (const x of [a[0] + h, b[0] - h]) {
    stripe(P(x, a[1] + h), P(x, CROSS_Z - h));
    stripe(P(x, CROSS_Z + h), P(x, d[1] - h));
  }
  stripe(P(a[0] + h, CROSS_Z - h), P(b[0] - h, CROSS_Z - h));
  stripe(P(a[0] + h, CROSS_Z + h), P(b[0] - h, CROSS_Z + h));
  // direction chevrons along each one-way lane
  const chevrons = (x0: number, z0: number, x1: number, z1: number) => {
    const L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L;
    for (let t = 1.2; t < L - 0.9; t += 1.75) {
      const px = x0 + ux * t, pz = z0 + uz * t;
      if (DOCKS.some(([dx, dz]) => Math.hypot(dx - px, dz - pz) < 0.95)) continue;
      const tip: V3 = [px + ux * 0.2, y, pz + uz * 0.2];
      for (const sgn of [-1, 1]) {
        B.line([px - ux * 0.12 - uz * 0.24 * sgn, y, pz - uz * 0.12 + ux * 0.24 * sgn], tip, 0.016, { l: 0.92, a: 0.85 }, { flat: up, seg: 0.12 });
      }
    }
  };
  const loop = [a, b, c, d, a];
  for (let i = 0; i < 4; i++) chevrons(loop[i][0], loop[i][1], loop[i + 1][0], loop[i + 1][1]);
  chevrons(b[0], CROSS_Z, a[0], CROSS_Z);
  // docking pads: a hatched yellow box on the lane
  for (const [dx, dz] of DOCKS) {
    const w = 0.58, dpt = 0.4;
    const q: V3[] = [P(dx - w, dz - dpt), P(dx + w, dz - dpt), P(dx + w, dz + dpt), P(dx - w, dz + dpt)];
    for (let i = 0; i < 4; i++) B.line(q[i], q[(i + 1) % 4], 0.022, paint, { flat: up, seg: 0.16 });
    for (let k = -2; k <= 2; k++) B.line(P(dx + k * 0.24 - 0.2, dz + dpt), P(dx + k * 0.24 + 0.2, dz - dpt), 0.012, { l: 0.9, k: KIND.CONE, a: 0.7 }, { flat: up, seg: 0.16 });
  }

  // ---- workstations: a machine bed, a cabinet, a fence, a stack light; the arm is a moving group
  const flat = shade([], 1);
  CELLS.forEach((cell, i) => {
    const { x, z, face } = cell; // face: +1 the cell opens to the south, -1 to the north
    const bedH = 0.9;
    litBox(B, [x, bedH / 2, z], [1.5, bedH, 1.05], 0.06, 0.4, 0.24, sh, (f, _p, aa, bb) => {
      if (f === 0) {
        if (aa % 0.5 < 0.05 || bb % 0.35 < 0.05) return { l: 0.14 }; // T-slots of the bed
        return undefined;
      }
      if (bb < 0.16) return { l: 0.07 };
      if ((f === 1 || f === 2) && aa > 0.2 && aa < 0.62 && bb > 0.42 && bb < 0.7) return { l: 1, f: FLAG.GLOW };
      return undefined;
    });
    // the part being worked on, towards the open side
    litBox(B, [x + 0.3, bedH + 0.11, z + face * 0.22], [0.36, 0.22, 0.3], 0.04, 0.7, 0.5, sh);
    // control cabinet at the back
    const cz = z - face * 0.86;
    litBox(B, [x - 0.5, 0.65, cz], [0.5, 1.3, 0.36], 0.06, 0.4, 0.26, sh, (f, _p, aa, bb) => {
      if ((f === 1 || f === 2) && aa > 0.1 && aa < 0.4 && bb > 0.75 && bb < 1.12) return { l: 1, f: FLAG.GLOW };
      return undefined;
    });
    B.line([x - 0.5, 1.3, cz], [x - 0.5, 1.68, cz], 0.012, { l: 0.7 });
    B.sphere([x - 0.5, 1.73, cz], 0.055, 0.02, () => ({ l: 1, k: KIND.CONE }));
    // fence on three sides, open towards the dock
    const fx0 = x - 0.98, fx1 = x + 0.98, zb = z - face * 1.08, zf = z + face * 0.62;
    for (const fy of [1.0]) {
      B.line([fx0, fy, zb], [fx1, fy, zb], 0.007, { l: 0.5, a: 0.8 });
      B.line([fx0, fy, zb], [fx0, fy, zf], 0.007, { l: 0.5, a: 0.8 });
      B.line([fx1, fy, zb], [fx1, fy, zf], 0.007, { l: 0.5, a: 0.8 });
    }
    for (const [px, pz] of [[fx0, zb], [fx1, zb], [fx0, zf], [fx1, zf]]) B.line([px, 0, pz], [px, 1.0, pz], 0.008, { l: 0.45, a: 0.8 });

    // the arm: built around its own vertical axis, reaching along local +x
    B.group = GROUP.ARM0 + i;
    const y0 = bedH;
    B.cyl([0, y0, 0], 0.13, 0.1, 0.3, 0.035, (_a, _t, p, n) => ({ l: 0.75 * flat(p, n) }));
    const J: V3[] = [[0, y0 + 0.36, 0], [0.26, y0 + 0.92, 0], [0.8, y0 + 0.7, 0], [0.8, y0 + 0.42, 0]];
    B.line(J[0], J[1], 0.05, { l: 0.98, a: 0.97 }, { seg: 0.07 });
    B.line(J[1], J[2], 0.04, { l: 0.98, a: 0.97 }, { seg: 0.07 });
    B.line(J[2], J[3], 0.026, { l: 0.9 }, { seg: 0.06 });
    B.sphere(J[0], 0.1, 0.03, () => ({ l: 0.55 }));
    B.sphere(J[1], 0.08, 0.028, () => ({ l: 0.55 }));
    B.sphere(J[2], 0.06, 0.025, () => ({ l: 0.55 }));
    B.sphere([J[3][0], J[3][1] - 0.04, 0], 0.04, 0.02, () => ({ l: 1, f: FLAG.GLOW }));
    B.group = 0;
  });

  // ---- racking along the west wall
  for (let bay = 0; bay < 4; bay++) {
    const z0 = 16.6 + bay * 2.05;
    for (const ry of [0.45, 1.3, 2.15]) {
      litBox(B, [0.8, ry, z0 + 0.95], [0.85, 0.05, 1.9], 0.07, 0.6, 0.4, sh);
      const n = 2 + Math.floor(B.rnd() * 2);
      for (let k = 0; k < n; k++) {
        const s = 0.32 + B.rnd() * 0.22, hh = 0.25 + B.rnd() * 0.3;
        litBox(B, [0.8, ry + 0.03 + hh / 2, z0 + 0.3 + k * 0.6 + B.rnd() * 0.1], [0.55, hh, s], 0.07, 0.74, 0.5, sh);
      }
    }
    for (const z of [z0, z0 + 1.9]) for (const x of [0.4, 1.2]) B.line([x, 0, z], [x, 2.7, z], 0.014, { l: 0.72 });
  }
  // ---- conveyor along the south wall, with its rollers and a few totes
  litBox(B, [8.2, 0.78, 24.25], [9.4, 0.1, 0.72], 0.065, 0.66, 0.32, sh);
  for (let x = 3.8; x <= 12.6; x += 1.1) {
    B.line([x, 0, 24.0], [x, 0.74, 24.0], 0.014, { l: 0.5 });
    B.line([x, 0, 24.5], [x, 0.74, 24.5], 0.014, { l: 0.5 });
  }
  for (let x = 3.7; x <= 12.7; x += 0.3) B.line([x, 0.84, 23.93], [x, 0.84, 24.57], 0.008, { l: 0.3, a: 0.8 }, { flat: up, seg: 0.3 });
  for (let k = 0; k < 7; k++) {
    const s = 0.3 + B.rnd() * 0.2;
    litBox(B, [4.2 + k * 1.25 + B.rnd() * 0.3, 0.83 + s / 2, 24.25], [s + 0.1, s, s], 0.055, 0.8, 0.55, sh);
  }
  // ---- charging bays by the door wall
  for (let k = 0; k < 4; k++) {
    const x = 6.2 + k * 1.5;
    litBox(B, [x, 0.3, 13.42], [0.5, 0.6, 0.3], 0.05, 0.6, 0.4, sh, (f, _p, aa, bb) => (f === 2 && aa > 0.15 && aa < 0.35 && bb > 0.3 && bb < 0.48 ? { l: 1, k: KIND.CONE } : undefined));
    const q: V3[] = [P(x - 0.45, 13.65), P(x + 0.45, 13.65), P(x + 0.45, 14.75), P(x - 0.45, 14.75)];
    for (let i = 0; i < 4; i++) B.line(q[i], q[(i + 1) % 4], 0.014, { l: 0.8, a: 0.8 }, { flat: up, seg: 0.2 });
  }

  // ---- the mobile robots (one group each, driven by the traffic simulation)
  for (let r = 0; r < GROUP.AMR_N; r++) {
    B.group = GROUP.AMR0 + r;
    const A = 1.5;
    litBox(B, [0, 0.17 * A, 0], [0.74 * A, 0.2 * A, 0.52 * A], 0.042, 0.5, 0.2, flat);
    litBox(B, [0, 0.3 * A, 0], [0.62 * A, 0.035, 0.44 * A], 0.036, 1, 0.85, flat, (f) => (f === 0 ? { l: 1, f: FLAG.GLOW, a: 0.97 } : undefined));
    B.cyl([0.22 * A, 0.32 * A, 0], 0.075, 0.075, 0.07, 0.03, () => ({ l: 0.1 }));
    B.line([0.38 * A, 0.17 * A, -0.2 * A], [0.38 * A, 0.17 * A, 0.2 * A], 0.014, GLOW, { seg: 0.06 });
    B.line([-0.24 * A, 0.32 * A, 0.14 * A], [-0.24 * A, 0.46 * A, 0.14 * A], 0.01, { l: 0.8 }, { seg: 0.05 });
    B.sphere([-0.24 * A, 0.5 * A, 0.14 * A], 0.07, 0.022, () => ({ l: 1, k: KIND.CONE, f: FLAG.GLOW }));
    // most of them carry a tote or a small shelf
    if (r % 3 === 0) litBox(B, [-0.04, 0.33 * A + 0.17, 0], [0.46, 0.32, 0.4], 0.045, 0.66, 0.42, flat);
    if (r % 3 === 1) {
      for (const sy of [0.34, 0.62]) litBox(B, [-0.02, 0.33 * A + sy, 0], [0.6, 0.03, 0.48], 0.05, 0.9, 0.6, flat);
      for (const [px, pz] of [[0.28, 0.22], [0.28, -0.22], [-0.3, 0.22], [-0.3, -0.22]]) B.line([px, 0.33 * A, pz], [px, 0.33 * A + 0.64, pz], 0.01, { l: 0.8 }, { seg: 0.1 });
      litBox(B, [0, 0.33 * A + 0.44, 0], [0.34, 0.16, 0.3], 0.05, 0.72, 0.5, flat);
    }
  }
  B.group = 0;
}

// ------------------------------------------------------------ fil rouge ---

function filRouge(B: Builder) {
  B.room = 6;
  const H = 3.0;
  const sh = shade([{ p: [17.9, 2.6, 19.6], i: 1.3, r: 2.8 }, { p: [15.2, 2.4, 19.6], i: 0.5, r: 2 }], 0.3);
  floor(B, 14, 14.5, 20, 24, 0.075, () => 0.24, sh, 1, 0.6);
  wall(B, 14, 14.5, 20, 14.5, H, 0.09, 0.4, sh);
  // east wall, with the opening that holds the screen (the camera feed of the real robot)
  const S = SCREEN;
  wall(B, 20, 14.5, 20, 24, H, 0.09, 0.4, sh, [{ a0: S.z0 - 14.5, a1: S.z1 - 14.5, b0: S.y0, b1: S.y1 }], 0, false);
  wall(B, 14, 24, 20, 24, H, 0.09, 0.4, sh);
  const fr: V3[] = [[S.x, S.y0, S.z0], [S.x, S.y0, S.z1], [S.x, S.y1, S.z1], [S.x, S.y1, S.z0]];
  for (let i = 0; i < 4; i++) B.line(fr[i], fr[(i + 1) % 4], 0.016, GLOW, { seg: 0.1 });
  // a cable down from the screen to a small box on the floor
  B.line([S.x - 0.02, S.y0, S.z1 - 0.2], [S.x - 0.02, 0.3, S.z1 - 0.2], 0.006, { l: 0.7 });
  litBox(B, [19.75, 0.15, S.z1 - 0.2], [0.34, 0.3, 0.3], 0.04, 0.6, 0.42, sh);
  B.sphere([17.9, 2.62, 16.6], 0.16, 0.035, () => ({ l: 1, f: FLAG.GLOW }));
  B.line([17.9, 2.78, 16.6], [17.9, H + 0.4, 16.6], 0.005, { l: 0.8 });

  // the pen: low boards, like the plywood arena of the real robot
  const { x0, z0, x1, z1 } = PEN;
  const hb = 0.34;
  const board = (ax: number, az: number, bx: number, bz: number) => {
    const u: V3 = [bx - ax, 0, bz - az];
    const n = norm(cross(norm(u), [0, 1, 0]));
    B.surf([ax, 0, az], u, [0, hb, 0], 0.04, (_a, b, p) => ({ l: 0.78 * sh(p, n) * (0.7 + 0.3 * b / hb) }), 0.014);
    B.line([ax, hb, az], [bx, hb, bz], 0.012, GLOW);
  };
  board(x0, z0, x1, z0); board(x1, z0, x1, z1); board(x1, z1, x0, z1); board(x0, z1, x0, z0);
  // two crates outside the pen
  litBox(B, [15.0, 0.2, 16.0], [0.6, 0.4, 0.45], 0.045, 0.62, 0.42, sh);
  litBox(B, [15.1, 0.55, 16.02], [0.42, 0.3, 0.36], 0.045, 0.7, 0.48, sh);
  litBox(B, [18.6, 0.19, 23.2], [0.7, 0.38, 0.5], 0.045, 0.6, 0.4, sh);

  const flat = shade([], 1);
  const up: V3 = [0, 1, 0];
  // the robot: four wheels, a deck, a camera looking forward (+x)
  B.group = GROUP.ROBOT;
  const K = 1.45;
  litBox(B, [0, 0.12 * K, 0], [0.4 * K, 0.07 * K, 0.24 * K], 0.014, 0.5, 0.3, flat);
  litBox(B, [-0.05 * K, 0.2 * K, 0], [0.22 * K, 0.09 * K, 0.18 * K], 0.014, 0.95, 0.74, flat);
  for (const [wx, wz] of [[0.14, 0.17], [0.14, -0.17], [-0.14, 0.17], [-0.14, -0.17]]) {
    B.sphere([wx * K, 0.085 * K, wz * K], 0.085 * K, 0.014, (_p, n) => ({ l: Math.abs(n[2]) > 0.75 ? 0.6 : 0.06 }));
  }
  B.line([0.17 * K, 0.16 * K, 0], [0.17 * K, 0.3 * K, 0], 0.012, { l: 0.8 }, { seg: 0.04 });
  litBox(B, [0.18 * K, 0.33 * K, 0], [0.06 * K, 0.06 * K, 0.1 * K], 0.014, 1, 1, flat);
  // what its camera sees: the field of view on the floor and the image centre line.
  // Keeping the ball centred means keeping it on that line.
  const fovHalf = 0.54, reach = 1.7, ox = 0.2 * K;
  for (const sgn of [-1, 1]) {
    B.line([ox, 0.012, 0], [ox + Math.cos(fovHalf) * reach, 0.012, Math.sin(fovHalf) * reach * sgn], 0.012, { l: 1, k: KIND.CONE, a: 0.85 }, { flat: up, seg: 0.1 });
  }
  for (let t = 0.12; t < reach; t += 0.2) B.line([ox + t, 0.012, 0], [ox + t + 0.1, 0.012, 0], 0.01, { l: 1, a: 0.9 }, { flat: up, seg: 0.1 });
  for (let k = -5; k < 5; k++) {
    const a0 = (k / 5) * fovHalf, a1 = ((k + 1) / 5) * fovHalf;
    B.line([ox + Math.cos(a0) * reach, 0.012, Math.sin(a0) * reach], [ox + Math.cos(a1) * reach, 0.012, Math.sin(a1) * reach], 0.01, { l: 1, k: KIND.CONE, a: 0.6 }, { flat: up, seg: 0.1 });
  }
  // the ball
  B.group = GROUP.BALL;
  B.sphere([0, 0.15, 0], 0.15, 0.014, (_p, n) => ({ l: 0.75 + 0.25 * n[1], k: KIND.FIL }));
  B.group = 0;
}

// ---------------------------------------------------------- sensor fan ---

function sensorFan(B: Builder) {
  B.room = 4;
  B.group = GROUP.FAN;
  const up: V3 = [0, 1, 0];
  const q = basisQuat([0, 0, 1], [1, 0, 0], up);
  const n = Math.round(2400 * B.density);
  // local coordinates are polar and normalised: x = rho (0..1), z = phi (-1..1);
  // the vertex shader turns them into metres with the live range and opening angle
  for (let i = 0; i < n; i++) {
    const rho = Math.sqrt(0.02 + 0.98 * B.rnd());
    const phi = B.rnd() * 2 - 1;
    B.push([rho, 0.03, phi], [0.13, 0.13, 0.004], q, 255, 255, 255, 0.055, KIND.CONE, FLAG.FAN);
  }
  const edge = Math.round(260 * Math.sqrt(B.density));
  for (let i = 0; i < edge; i++) {
    const t = (i + 0.5) / edge;
    B.push([t, 0.035, -1], [0.026, 0.026, 0.004], q, 255, 255, 255, 0.9, KIND.CONE, FLAG.FAN | FLAG.GLOW);
    B.push([t, 0.035, 1], [0.026, 0.026, 0.004], q, 255, 255, 255, 0.9, KIND.CONE, FLAG.FAN | FLAG.GLOW);
    B.push([1, 0.035, t * 2 - 1], [0.026, 0.026, 0.004], q, 255, 255, 255, 0.9, KIND.CONE, FLAG.FAN | FLAG.GLOW);
  }
  B.group = 0;
}

// ---------------------------------------------------------------- dust ---

function dust(B: Builder) {
  B.room = 0;
  const n = Math.round(2600 * B.density);
  const q: [number, number, number, number] = [0, 0, 0, 1];
  for (let i = 0; i < n; i++) {
    const p: V3 = [B.rnd() * 20, 0.15 + B.rnd() * 3.2, B.rnd() * 25];
    const s = 0.005 + B.rnd() * 0.008;
    B.push(p, [s, s, s], q, 245, 245, 245, 0.3 + B.rnd() * 0.3, KIND.DUST, 0);
  }
}

export function buildScene(inp: GenInput) {
  const B = new Builder(Math.round(300000 * inp.density + 20000), inp.seed, inp.density);
  lobby(B);
  vestibule(B, inp.input);
  aist(B, inp.pano);
  const cones = tlse(B);
  factory(B);
  filRouge(B);
  sensorFan(B);
  dust(B);
  return { B, cones };
}

export function addPath(B: Builder, pts: Float32Array, total: number) {
  B.room = 0;
  B.group = 0;
  const n = pts.length / 2;
  const up: V3 = [0, 1, 0];
  const step = Math.max(1, Math.round(0.05 / (total / (n - 1))));
  for (let i = 0; i + step < n; i += step) {
    const x = pts[i * 2], z = pts[i * 2 + 1];
    const x1 = pts[(i + step) * 2], z1 = pts[(i + step) * 2 + 1];
    const dir = norm([x1 - x, 0, z1 - z]);
    const side = norm(cross(up, dir));
    const frac = Math.round((i / (n - 1)) * 65535);
    B.push([(x + x1) / 2, 0.028, (z + z1) / 2], [0.034, 0.022, 0.004], basisQuat(dir, side, up),
      255, 255, 255, 0.98, KIND.FIL, FLAG.PATH, frac >> 8, frac & 255, 0);
  }
}

/** Birth times for the training animation: a few seeds first, then densification. */
export function assignBirth(B: Builder) {
  for (let i = 0; i < B.n; i++) {
    const flags = B.meta[i * 4 + 2];
    let b: number;
    if (flags & FLAG.PATH) b = 0.7;
    else if (B.rnd() < 0.05) b = 0;
    else b = 0.05 + 0.65 * Math.pow(B.rnd(), 1.15);
    B.scale[i * 4 + 3] = b;
  }
}
