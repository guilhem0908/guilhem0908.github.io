// Splat buffer builder: every primitive of the procedural building ends up here as
// real 3D Gaussians (centre, anisotropic scale, rotation quaternion, colour, opacity).

export const KIND = { STRUCT: 0, PHOTO: 1, FIL: 2, CONE: 3, ARTEFACT: 4, DUST: 5 } as const;
export const FLAG = { CEIL: 1, PATH: 2, TAG: 4, GLOW: 8, FAN: 16 } as const;
export const TEX_W = 1024;

export type V3 = [number, number, number];

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Quaternion of the rotation whose matrix columns are (u, v, n). */
export function basisQuat(u: V3, v: V3, n: V3): [number, number, number, number] {
  const m00 = u[0], m10 = u[1], m20 = u[2];
  const m01 = v[0], m11 = v[1], m21 = v[2];
  const m02 = n[0], m12 = n[1], m22 = n[2];
  const tr = m00 + m11 + m22;
  let x: number, y: number, z: number, w: number;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    w = 0.25 * s; x = (m21 - m12) / s; y = (m02 - m20) / s; z = (m10 - m01) / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    w = (m21 - m12) / s; x = 0.25 * s; y = (m01 + m10) / s; z = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    w = (m02 - m20) / s; x = (m01 + m10) / s; y = 0.25 * s; z = (m12 + m21) / s;
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    w = (m10 - m01) / s; x = (m02 + m20) / s; y = (m12 + m21) / s; z = 0.25 * s;
  }
  return [x, y, z, w];
}

export function anyPerp(d: V3): V3 {
  const a: V3 = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  return norm(cross(d, a));
}

export interface Sample {
  /** luminance 0..1 (duotone kinds) */
  l?: number;
  /** explicit colour 0..255 */
  c?: V3;
  alt?: V3;
  a?: number;
  k?: number;
  f?: number;
}

export class Builder {
  n = 0;
  cap: number;
  center: Float32Array;
  scale: Float32Array;
  quat: Float32Array;
  color: Uint8Array;
  alt: Uint8Array;
  meta: Uint8Array;
  rnd: () => number;
  group = 0;
  room = 0;
  density: number;

  constructor(cap: number, seed: number, density: number) {
    this.cap = cap;
    this.center = new Float32Array(cap * 4);
    this.scale = new Float32Array(cap * 4);
    this.quat = new Float32Array(cap * 4);
    this.color = new Uint8Array(cap * 4);
    this.alt = new Uint8Array(cap * 4);
    this.meta = new Uint8Array(cap * 4);
    this.rnd = mulberry32(seed);
    this.density = density;
  }

  private grow() {
    const cap = Math.ceil(this.cap * 1.5);
    const g = <T extends Float32Array | Uint8Array>(a: T): T => {
      const b = new (a.constructor as any)(cap * 4) as T;
      b.set(a);
      return b;
    };
    this.center = g(this.center); this.scale = g(this.scale); this.quat = g(this.quat);
    this.color = g(this.color); this.alt = g(this.alt); this.meta = g(this.meta);
    this.cap = cap;
  }

  /** spacing adjusted by the device density factor */
  sp(s: number) {
    return s / Math.sqrt(this.density);
  }

  push(
    p: V3, s: V3, q: [number, number, number, number],
    r: number, g: number, b: number, a: number,
    kind = 0, flags = 0, ar = r, ag = g, ab = b, aa = 255,
  ) {
    if (this.n >= this.cap) this.grow();
    const i = this.n * 4;
    this.center[i] = p[0]; this.center[i + 1] = p[1]; this.center[i + 2] = p[2];
    this.center[i + 3] = this.rnd();
    this.scale[i] = s[0]; this.scale[i + 1] = s[1]; this.scale[i + 2] = s[2];
    this.scale[i + 3] = 0;
    this.quat[i] = q[0]; this.quat[i + 1] = q[1]; this.quat[i + 2] = q[2]; this.quat[i + 3] = q[3];
    this.color[i] = r; this.color[i + 1] = g; this.color[i + 2] = b; this.color[i + 3] = Math.round(a * 255);
    this.alt[i] = ar; this.alt[i + 1] = ag; this.alt[i + 2] = ab; this.alt[i + 3] = aa;
    this.meta[i] = kind; this.meta[i + 1] = this.group; this.meta[i + 2] = flags; this.meta[i + 3] = this.room;
    this.n++;
  }

  private emit(p: V3, s: V3, q: [number, number, number, number], smp: Sample, defA = 0.9) {
    const k = smp.k ?? KIND.STRUCT;
    let r: number, g: number, b: number;
    if (smp.c) { r = smp.c[0]; g = smp.c[1]; b = smp.c[2]; }
    else {
      const l = Math.max(0, Math.min(1, (smp.l ?? 0.5) + (this.rnd() - 0.5) * 0.05));
      r = g = b = Math.round(l * 255);
    }
    const al = smp.alt ?? [r, g, b];
    this.push(p, s, q, r, g, b, smp.a ?? defA, k, smp.f ?? 0, al[0], al[1], al[2]);
  }

  /**
   * Fill the parallelogram o + a*u + b*v with flat, surface-aligned Gaussians.
   * fn receives metric coordinates along u and v and the world point.
   */
  surf(o: V3, u: V3, v: V3, spacing: number, fn: (a: number, b: number, p: V3) => Sample | null, thick = 0.012) {
    const sp = this.sp(spacing);
    const lu = len(u), lv = len(v);
    const nu = Math.max(1, Math.round(lu / sp)), nv = Math.max(1, Math.round(lv / sp));
    const uh = norm(u), vh = norm(v), n = norm(cross(uh, vh));
    const cu = lu / nu, cv = lv / nv;
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = (i + 0.15 + 0.7 * this.rnd()) * cu;
        const b = (j + 0.15 + 0.7 * this.rnd()) * cv;
        const p: V3 = [o[0] + uh[0] * a + vh[0] * b, o[1] + uh[1] * a + vh[1] * b, o[2] + uh[2] * a + vh[2] * b];
        const smp = fn(a, b, p);
        if (!smp) continue;
        const ang = this.rnd() * Math.PI;
        const c = Math.cos(ang), s = Math.sin(ang);
        const ru: V3 = [uh[0] * c + vh[0] * s, uh[1] * c + vh[1] * s, uh[2] * c + vh[2] * s];
        const rv: V3 = [-uh[0] * s + vh[0] * c, -uh[1] * s + vh[1] * c, -uh[2] * s + vh[2] * c];
        const sx = cu * (0.44 + 0.3 * this.rnd());
        const sy = cv * (0.44 + 0.3 * this.rnd());
        this.emit(p, [sx, sy, thick], basisQuat(ru, rv, n), smp);
      }
    }
  }

  /** A crisp line made of elongated Gaussians (needles lying along the segment). */
  line(p0: V3, p1: V3, width: number, smp: Sample, opts: { flat?: V3; seg?: number } = {}) {
    const d = sub(p1, p0);
    const L = len(d);
    if (L < 1e-4) return;
    const dir = norm(d);
    const seg = Math.max(width * 2.5, this.sp(opts.seg ?? 0.14));
    const n = Math.max(1, Math.round(L / seg));
    const nrm = opts.flat ? norm(opts.flat) : anyPerp(dir);
    const side = norm(cross(nrm, dir));
    const q = basisQuat(dir, side, nrm);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const p: V3 = [p0[0] + d[0] * t, p0[1] + d[1] * t, p0[2] + d[2] * t];
      this.emit(p, [(L / n) * 0.62, width, opts.flat ? 0.006 : width], q, smp, 0.95);
    }
  }

  /** Axis-aligned box: five visible faces (no bottom). */
  box(c: V3, size: V3, spacing: number, fn: (face: number, p: V3, a: number, b: number) => Sample | null) {
    const [sx, sy, sz] = size;
    const x0 = c[0] - sx / 2, x1 = c[0] + sx / 2;
    const y0 = c[1] - sy / 2, y1 = c[1] + sy / 2;
    const z0 = c[2] - sz / 2, z1 = c[2] + sz / 2;
    this.surf([x0, y1, z0], [sx, 0, 0], [0, 0, sz], spacing, (a, b, p) => fn(0, p, a, b)); // top
    this.surf([x0, y0, z0], [sx, 0, 0], [0, sy, 0], spacing, (a, b, p) => fn(1, p, a, b)); // north
    this.surf([x0, y0, z1], [sx, 0, 0], [0, sy, 0], spacing, (a, b, p) => fn(2, p, a, b)); // south
    this.surf([x0, y0, z0], [0, 0, sz], [0, sy, 0], spacing, (a, b, p) => fn(3, p, a, b)); // west
    this.surf([x1, y0, z0], [0, 0, sz], [0, sy, 0], spacing, (a, b, p) => fn(4, p, a, b)); // east
  }

  /** Lateral surface of a vertical cylinder or frustum (r0 at the base, r1 at the top). */
  cyl(base: V3, r0: number, r1: number, h: number, spacing: number, fn: (ang: number, t: number, p: V3, n: V3) => Sample | null) {
    const sp = this.sp(spacing);
    const rows = Math.max(1, Math.round(Math.hypot(h, r0 - r1) / sp));
    for (let j = 0; j < rows; j++) {
      const t = (j + 0.5) / rows;
      const r = r0 + (r1 - r0) * t;
      const cnt = Math.max(3, Math.round((2 * Math.PI * r) / sp));
      for (let i = 0; i < cnt; i++) {
        const ang = ((i + this.rnd()) / cnt) * Math.PI * 2;
        const tt = (j + this.rnd()) / rows;
        const rr = r0 + (r1 - r0) * tt;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const p: V3 = [base[0] + ca * rr, base[1] + h * tt, base[2] + sa * rr];
        const slope = (r0 - r1) / h;
        const n = norm([ca, slope, sa]);
        const tang: V3 = [-sa, 0, ca];
        const up = norm(cross(n, tang));
        const smp = fn(ang, tt, p, n);
        if (!smp) continue;
        const w = ((2 * Math.PI * rr) / cnt) * 0.62;
        this.emit(p, [Math.max(0.008, w), (Math.hypot(h, r0 - r1) / rows) * 0.62, 0.01], basisQuat(tang, up, n), smp);
      }
    }
  }

  sphere(c: V3, r: number, spacing: number, fn: (p: V3, n: V3) => Sample | null) {
    const sp = this.sp(spacing);
    const cnt = Math.max(12, Math.round((4 * Math.PI * r * r) / (sp * sp)));
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < cnt; i++) {
      const y = 1 - ((i + 0.5) / cnt) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = ga * i;
      const n: V3 = [Math.cos(th) * rad, y, Math.sin(th) * rad];
      const p: V3 = [c[0] + n[0] * r, c[1] + n[1] * r, c[2] + n[2] * r];
      const smp = fn(p, n);
      if (!smp) continue;
      const t = anyPerp(n);
      const b = cross(n, t);
      this.emit(p, [sp * 0.6, sp * 0.6, 0.01], basisQuat(t, b, n), smp);
    }
  }
}
