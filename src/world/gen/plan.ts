// Occupancy grid sliced from the Gaussians, then A* through the via points.

import { BOUNDS, CELL, type Via } from '../layout';
import { FLAG, KIND, type Builder } from './builder';

export function occupancy(B: Builder) {
  const W = Math.round((BOUNDS.x1 - BOUNDS.x0) / CELL);
  const H = Math.round((BOUNDS.z1 - BOUNDS.z0) / CELL);
  const grid = new Uint8Array(W * H);
  for (let i = 0; i < B.n; i++) {
    const k = B.meta[i * 4], g = B.meta[i * 4 + 1], f = B.meta[i * 4 + 2];
    if (g !== 0 || k === KIND.ARTEFACT || k === KIND.DUST || f & (FLAG.PATH | FLAG.CEIL | FLAG.FAN)) continue;
    const y = B.center[i * 4 + 1];
    if (y < 0.14 || y > 1.7) continue;
    const cx = Math.floor((B.center[i * 4] - BOUNDS.x0) / CELL);
    const cz = Math.floor((B.center[i * 4 + 2] - BOUNDS.z0) / CELL);
    if (cx < 0 || cz < 0 || cx >= W || cz >= H) continue;
    grid[cz * W + cx] = 1;
  }
  return { grid, W, H };
}

/** Chebyshev distance (in cells) to the nearest occupied cell, capped. */
function clearance(grid: Uint8Array, W: number, H: number, cap: number) {
  const d = new Uint8Array(W * H).fill(cap);
  let frontier: number[] = [];
  for (let i = 0; i < grid.length; i++) if (grid[i]) { d[i] = 0; frontier.push(i); }
  for (let step = 1; step < cap && frontier.length; step++) {
    const next: number[] = [];
    for (const i of frontier) {
      const x = i % W, z = (i / W) | 0;
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, nz = z + dz;
        if (nx < 0 || nz < 0 || nx >= W || nz >= H) continue;
        const j = nz * W + nx;
        if (d[j] > step) { d[j] = step; next.push(j); }
      }
    }
    frontier = next;
  }
  return d;
}

class Heap {
  ids: number[] = [];
  keys: number[] = [];
  push(id: number, key: number) {
    const { ids, keys } = this;
    let i = ids.length;
    ids.push(id); keys.push(key);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (keys[p] <= key) break;
      ids[i] = ids[p]; keys[i] = keys[p];
      i = p;
    }
    ids[i] = id; keys[i] = key;
  }
  pop(): number {
    const { ids, keys } = this;
    const top = ids[0];
    const lid = ids.pop()!, lk = keys.pop()!;
    const n = ids.length;
    if (n) {
      let i = 0;
      for (;;) {
        let c = i * 2 + 1;
        if (c >= n) break;
        if (c + 1 < n && keys[c + 1] < keys[c]) c++;
        if (keys[c] >= lk) break;
        ids[i] = ids[c]; keys[i] = keys[c];
        i = c;
      }
      ids[i] = lid; keys[i] = lk;
    }
    return top;
  }
  get size() { return this.ids.length; }
}

function astar(clear: Uint8Array, W: number, H: number, s: number, g: number, inflate: number, cap: number): number[] {
  const N = W * H;
  const gs = new Float32Array(N).fill(Infinity);
  const from = new Int32Array(N).fill(-1);
  const closed = new Uint8Array(N);
  const heap = new Heap();
  const gx = g % W, gz = (g / W) | 0;
  const h = (i: number) => {
    const dx = Math.abs((i % W) - gx), dz = Math.abs(((i / W) | 0) - gz);
    return Math.max(dx, dz) + 0.4142 * Math.min(dx, dz);
  };
  gs[s] = 0;
  heap.push(s, h(s));
  while (heap.size) {
    const i = heap.pop();
    if (i === g) break;
    if (closed[i]) continue;
    closed[i] = 1;
    const x = i % W, z = (i / W) | 0;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dz) continue;
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nz < 0 || nx >= W || nz >= H) continue;
      const j = nz * W + nx;
      if (closed[j]) continue;
      const c = clear[j];
      if (c <= inflate && j !== g) continue;
      const pot = 1 - Math.min(1, (c - inflate) / (cap - inflate));
      const cost = (dx && dz ? 1.4142 : 1) * (1 + 4 * pot * pot);
      const ng = gs[i] + cost;
      if (ng < gs[j]) {
        gs[j] = ng; from[j] = i;
        heap.push(j, ng + h(j));
      }
    }
  }
  const out: number[] = [];
  if (from[g] < 0 && g !== s) return [s, g];
  for (let i = g; i >= 0; i = from[i]) out.push(i);
  return out.reverse();
}

export interface Planned {
  pts: Float32Array; // x,z pairs, uniform arc-length spacing
  total: number;
  marks: Record<string, number>; // metres along the path
  expanded: number;
}

export function plan(grid: Uint8Array, W: number, H: number, vias: Via[]): Planned {
  const CAP = 12, INFL = 3;
  const clear = clearance(grid, W, H, CAP);
  const cellOf = (x: number, z: number) => {
    let cx = Math.max(0, Math.min(W - 1, Math.floor((x - BOUNDS.x0) / CELL)));
    let cz = Math.max(0, Math.min(H - 1, Math.floor((z - BOUNDS.z0) / CELL)));
    if (clear[cz * W + cx] > INFL) return cz * W + cx;
    // snap to the nearest free cell
    for (let r = 1; r < 12; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
      const nx = cx + dx, nz = cz + dz;
      if (nx < 0 || nz < 0 || nx >= W || nz >= H) continue;
      if (clear[nz * W + nx] > INFL) return nz * W + nx;
    }
    return cz * W + cx;
  };
  const xs: number[] = [], zs: number[] = [];
  const viaIdx: number[] = [];
  const pinned: boolean[] = [];
  let expanded = 0;
  for (let v = 0; v < vias.length - 1; v++) {
    const a = cellOf(vias[v].x, vias[v].z), b = cellOf(vias[v + 1].x, vias[v + 1].z);
    const cells = astar(clear, W, H, a, b, INFL, CAP);
    expanded += cells.length;
    const startAt = v === 0 ? 0 : 1;
    if (v === 0) viaIdx.push(0);
    for (let k = startAt; k < cells.length; k++) {
      xs.push(BOUNDS.x0 + ((cells[k] % W) + 0.5) * CELL);
      zs.push(BOUNDS.z0 + (((cells[k] / W) | 0) + 0.5) * CELL);
      pinned.push(false);
    }
    viaIdx.push(xs.length - 1);
  }
  // exact via positions for pinned vias
  vias.forEach((v, i) => {
    const k = viaIdx[i];
    if (v.pin) { xs[k] = v.x; zs[k] = v.z; pinned[k] = true; }
  });
  pinned[0] = true; pinned[xs.length - 1] = true;
  // Laplacian smoothing (keeps the pins)
  const n = xs.length;
  for (let it = 0; it < 90; it++) {
    for (let i = 1; i < n - 1; i++) {
      if (pinned[i]) continue;
      xs[i] += 0.5 * ((xs[i - 1] + xs[i + 1]) / 2 - xs[i]);
      zs[i] += 0.5 * ((zs[i - 1] + zs[i + 1]) / 2 - zs[i]);
    }
  }
  // arc length + uniform resampling
  const cum = new Float32Array(n);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], zs[i] - zs[i - 1]);
  const total = cum[n - 1];
  const STEP = 0.04;
  const m = Math.ceil(total / STEP) + 1;
  const pts = new Float32Array(m * 2);
  let j = 0;
  for (let i = 0; i < m; i++) {
    const s = Math.min(total, (i / (m - 1)) * total);
    while (j < n - 2 && cum[j + 1] < s) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const t = (s - cum[j]) / seg;
    pts[i * 2] = xs[j] + (xs[j + 1] - xs[j]) * t;
    pts[i * 2 + 1] = zs[j] + (zs[j + 1] - zs[j]) * t;
  }
  const marks: Record<string, number> = {};
  vias.forEach((v, i) => { marks[v.name] = cum[viaIdx[i]]; });
  return { pts, total, marks, expanded };
}
