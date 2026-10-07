/// <reference lib="webworker" />
// Builds the Gaussian scene off the main thread, plans the path, then serves depth sorts.
// A sort also decides what is drawn at all: not the Gaussians behind the camera, beyond the fog,
// outside the view, or in a room the camera cannot see (a room next door is only seen through its door).

import { addPath, assignBirth, buildScene, type GenInput } from './gen/scene';
import { occupancy, plan } from './gen/plan';
import { FLAG, TEX_W } from './gen/builder';
import { GROUP, ROOMS, VIAS, type Sight } from './layout';

let count = 0;
let pos: Float32Array; // xyz + seed
let grp: Uint8Array;
let flg: Uint8Array;
let rooms: Uint8Array; // bit r: the Gaussian stands in room r or on one of its walls; 255: everywhere
let keys: Uint16Array;
let idx: Uint32Array;
const counts = new Uint32Array(65536);

function pad<T extends Float32Array | Uint8Array>(src: T, n: number, len: number): T {
  const out = new (src.constructor as any)(len) as T;
  out.set(src.subarray(0, n * 4));
  return out;
}

function generate(inp: GenInput) {
  const t0 = performance.now();
  const { B, cones } = buildScene(inp);
  const occ = occupancy(B);
  const p = plan(occ.grid, occ.W, occ.H, VIAS);
  addPath(B, p.pts, p.total);
  assignBirth(B);

  count = B.n;
  const texH = Math.ceil(count / TEX_W);
  const len = TEX_W * texH * 4;
  const center = pad(B.center, count, len);
  const scale = pad(B.scale, count, len);
  const quat = pad(B.quat, count, len);
  const color = pad(B.color, count, len);
  const alt = pad(B.alt, count, len);
  const meta = pad(B.meta, count, len);

  pos = new Float32Array(center); // private copy for sorting
  grp = new Uint8Array(count);
  flg = new Uint8Array(count);
  rooms = new Uint8Array(count);
  const M = 0.3; // a wall belongs to the rooms on both of its sides
  for (let i = 0; i < count; i++) {
    grp[i] = meta[i * 4 + 1]; flg[i] = meta[i * 4 + 2];
    const room = meta[i * 4 + 3];
    let bits = 0;
    if (grp[i]) bits = room ? 1 << room : 255; // a moving group stays in the room it was built in
    else {
      const x = pos[i * 4], z = pos[i * 4 + 2];
      for (let r = 1; r < ROOMS.length; r++) {
        const R = ROOMS[r];
        if (x > R.x0 - M && x < R.x1 + M && z > R.z0 - M && z < R.z1 + M) bits |= 1 << r;
      }
    }
    rooms[i] = bits || 255;
  }
  keys = new Uint16Array(count);
  idx = new Uint32Array(count);

  const coneArr = new Float32Array(cones.length * 3);
  cones.forEach((c, i) => { coneArr[i * 3] = c.x; coneArr[i * 3 + 1] = c.z; coneArr[i * 3 + 2] = c.side; });

  const msg = {
    type: 'scene',
    count, texW: TEX_W, texH,
    center, scale, quat, color, alt, meta,
    grid: occ.grid, gridW: occ.W, gridH: occ.H,
    path: p.pts, pathLen: p.total, marks: p.marks, expanded: p.expanded,
    cones: coneArr,
    ms: performance.now() - t0,
  };
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg, [
    center.buffer, scale.buffer, quat.buffer, color.buffer, alt.buffer, meta.buffer,
    occ.grid.buffer, p.pts.buffer, coneArr.buffer,
  ]);
}

interface SortMsg {
  type: 'sort';
  id: number;
  view: Float32Array; // column-major 4x4
  groups: Float32Array; // GROUP.COUNT * 4: x, z, yaw, lift
  fanR: number; // sensor fan: range (m)
  fanA: number; // and half opening (rad)
  tanX: number;
  tanY: number;
  far: number;
  /** which rooms are in sight, and through which doors (null: everything, as in the plan view) */
  sight: Sight | null;
  /** share of the surface Gaussians that is drawn: 1 unless the quality governor thins them */
  keep: number;
  recycle?: ArrayBuffer;
}

function sort(m: SortMsg) {
  const t0 = performance.now();
  const v = m.view, g = m.groups;
  const out = m.recycle && m.recycle.byteLength >= count * 4 ? new Float32Array(m.recycle) : new Float32Array(count);
  const near = 0.1, far = m.far;
  const kScale = 65535 / (far - near);
  const mx = m.tanX * 1.25, my = m.tanY * 1.25, margin = 1.2;
  const S = m.sight;
  const full = S ? S.full : 255, part = S ? S.part & ~S.full : 0, any = full | part;
  const W = S ? S.wedges : null;
  const keep = m.keep, thin = keep < 0.999;
  counts.fill(0);
  let n = 0;
  for (let i = 0; i < count; i++) {
    const rb = rooms[i];
    if (!(rb & any)) continue;
    if (thin && (flg[i] & FLAG.SURF) && pos[i * 4 + 3] > keep) continue;
    let x = pos[i * 4], y = pos[i * 4 + 1], z = pos[i * 4 + 2];
    const gi = grp[i];
    if (gi) {
      const o = gi * 4;
      if (gi === GROUP.FAN) {
        const r = x * m.fanR, a = z * m.fanA;
        x = r * Math.cos(a); z = r * Math.sin(a);
      }
      const cs = Math.cos(g[o + 2]), sn = Math.sin(g[o + 2]);
      const wx = cs * x - sn * z + g[o], wz = sn * x + cs * z + g[o + 1];
      x = wx; z = wz; y += g[o + 3];
    }
    const d = -(v[2] * x + v[6] * y + v[10] * z + v[14]);
    if (d < near || d > far) continue;
    const cx = v[0] * x + v[4] * y + v[8] * z + v[12];
    if (Math.abs(cx) > d * mx + margin) continue;
    const cy = v[1] * x + v[5] * y + v[9] * z + v[13];
    if (Math.abs(cy) > d * my + margin) continue;
    // a room seen through a door: only what stands in the wedge from the camera through that door
    if (!(rb & full)) {
      let seen = false;
      for (let r = 1; r < 8 && !seen; r++) {
        if (!(rb & part & (1 << r))) continue;
        const o = r * 8;
        seen = W![o] * x + W![o + 1] * z + W![o + 2] >= 0 && W![o + 3] * x + W![o + 4] * z + W![o + 5] >= 0;
      }
      if (!seen) continue;
    }
    const k = ((d - near) * kScale) | 0;
    keys[n] = k; idx[n] = i;
    counts[k]++;
    n++;
  }
  // counting sort, far to near
  let acc = 0;
  for (let k = 65535; k >= 0; k--) { const c = counts[k]; counts[k] = acc; acc += c; }
  for (let j = 0; j < n; j++) out[counts[keys[j]]++] = idx[j];
  (self as unknown as DedicatedWorkerGlobalScope).postMessage({ type: 'sorted', id: m.id, order: out, n, ms: performance.now() - t0 }, [out.buffer]);
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'generate') generate(m.input as GenInput);
  else if (m.type === 'sort') sort(m as SortMsg);
};
