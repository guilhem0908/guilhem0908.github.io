// Fleet of mobile robots on the one-way lanes of the factory hall.
// Each robot follows a closed route, stops at docking pads now and then, keeps its distance
// to the robot ahead and yields where the cross aisle merges into the loop. An illustration,
// not a planner: lanes are one-way so head-on conflicts cannot happen by construction.

import { CROSS_Z, DOCKS, ROUTES } from './layout';

interface Route { pts: [number, number][]; seg: number[]; total: number; docks: number[] }
interface Bot { route: number; s: number; v: number; wait: number; x: number; z: number; yaw: number; hx: number; hz: number; lap: number; target: number }

const V_MAX = 0.95; // m/s
const GAP = 1.45; // centre-to-centre distance at standstill (m)

function hash(a: number, b: number, c: number) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class Traffic {
  routes: Route[];
  bots: Bot[] = [];

  constructor(n: number) {
    this.routes = ROUTES.map((pts) => {
      const seg: number[] = [];
      let total = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        seg.push(L); total += L;
      }
      // arc positions of the docking pads that lie on this route
      const docks: number[] = [];
      let acc = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const ux = (b[0] - a[0]) / seg[i], uz = (b[1] - a[1]) / seg[i];
        for (const [dx, dz] of DOCKS) {
          const t = (dx - a[0]) * ux + (dz - a[1]) * uz;
          const off = Math.abs((dx - a[0]) * uz - (dz - a[1]) * ux);
          if (off < 0.05 && t > 0.4 && t < seg[i] - 0.4) docks.push(acc + t);
        }
        acc += seg[i];
      }
      docks.sort((p, q) => p - q);
      return { pts, seg, total, docks };
    });
    const onLoop = Math.round(n * 0.6);
    for (let r = 0; r < n; r++) {
      const route = r < onLoop ? 0 : 1;
      const k = route === 0 ? r : r - onLoop, m = route === 0 ? onLoop : n - onLoop;
      const R = this.routes[route];
      const b: Bot = { route, s: ((k + (route ? 0.6 : 0.2)) / m) * R.total, v: V_MAX, wait: 0, x: 0, z: 0, yaw: 0, hx: 1, hz: 0, lap: 0, target: -1 };
      this.pose(b);
      this.pick(b, r);
      this.bots.push(b);
    }
  }

  private at(R: Route, s: number): [number, number] {
    let d = ((s % R.total) + R.total) % R.total;
    let i = 0;
    while (d > R.seg[i]) { d -= R.seg[i]; i++; }
    const a = R.pts[i], b = R.pts[(i + 1) % R.pts.length];
    const u = d / R.seg[i];
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }

  private pose(b: Bot) {
    const R = this.routes[b.route];
    const p = this.at(R, b.s), q0 = this.at(R, b.s - 0.3), q1 = this.at(R, b.s + 0.3);
    b.x = p[0]; b.z = p[1];
    const dx = q1[0] - q0[0], dz = q1[1] - q0[1], l = Math.hypot(dx, dz) || 1;
    b.hx = dx / l; b.hz = dz / l;
    b.yaw = Math.atan2(dz, dx);
  }

  /** choose the next docking pad this robot will stop at (or none for this lap) */
  private pick(b: Bot, id: number) {
    const R = this.routes[b.route];
    const s = b.s % R.total;
    b.target = -1;
    for (let k = 0; k < R.docks.length; k++) {
      const ahead = (R.docks[k] - s + R.total) % R.total;
      if (ahead < 0.6) continue;
      if (hash(id, b.lap, k) < 0.42) { if (b.target < 0 || ahead < (R.docks[b.target] - s + R.total) % R.total) b.target = k; }
    }
  }

  step(dt: number) {
    const bots = this.bots;
    for (let i = 0; i < bots.length; i++) {
      const b = bots[i], R = this.routes[b.route];
      let vt = V_MAX;
      if (b.wait > 0) { b.wait -= dt; vt = 0; if (b.wait <= 0) { b.lap++; this.pick(b, i); } }
      else if (b.target >= 0) {
        const ds = (R.docks[b.target] - (b.s % R.total) + R.total) % R.total;
        if (ds < 0.04 || ds > R.total - 0.2) { b.wait = 1.6 + 1.8 * hash(i, b.lap, 99); vt = 0; b.v = 0; }
        else vt = Math.min(vt, Math.max(0.1, ds * 1.3));
      }
      // keep the distance to whoever is ahead
      for (let j = 0; j < bots.length; j++) {
        if (j === i) continue;
        const o = bots[j];
        const dx = o.x - b.x, dz = o.z - b.z, dist = Math.hypot(dx, dz);
        if (dist > 2.6 || dist < 1e-3) continue;
        if ((dx * b.hx + dz * b.hz) / dist < 0.62) continue;
        const mutual = (-dx * o.hx - dz * o.hz) / dist > 0.62;
        if (mutual && i < j) continue;
        vt = Math.min(vt, V_MAX * Math.max(0, Math.min(1, (dist - GAP) / 0.8)));
      }
      // give way where the cross aisle joins the west side of the loop
      if (b.route === 1) {
        const mergeS = R.seg[0] + R.seg[1] + R.seg[2];
        const toMerge = mergeS - (b.s % R.total);
        if (toMerge > 0 && toMerge < 1.5) {
          const wx = R.pts[3][0];
          for (let j = 0; j < bots.length; j++) {
            const o = bots[j];
            if (j === i || Math.abs(o.x - wx) > 0.3) continue;
            if (o.z > CROSS_Z - 1.5 && o.z < CROSS_Z + 2.6) vt = Math.min(vt, V_MAX * Math.max(0, (toMerge - 0.75) / 0.75));
          }
        }
      }
      const dv = vt - b.v;
      b.v += Math.max(-2.6 * dt, Math.min(1.1 * dt, dv));
      if (b.v < 0) b.v = 0;
      b.s += b.v * dt;
      if (b.s >= R.total) { b.s -= R.total; if (b.target < 0) { b.lap++; this.pick(b, i); } }
      this.pose(b);
    }
  }
}
