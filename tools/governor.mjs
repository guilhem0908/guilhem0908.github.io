// The quality governor against simulated machines (src/world/quality.ts). Chromium always has a GPU
// timer, so the path without one (Firefox, Safari) and the case of a browser that caps the page at
// 30 frames a second cannot be exercised in the headless runs: they are checked here.
//
//   node tools/governor.mjs        (Node 23.6 or newer: it imports the TypeScript file directly)
//
// A simulated GPU takes `base` ms for a frame at full scale; 78 % of that scales with the pixels.
// Frames are presented on a 60 Hz grid. Exit code 1 when a scenario fails.
import { Governor, SCALES, KEEPS, LEVELS } from '../src/world/quality.ts';

const VSYNC = 1000 / 60;
const scaleOf = (l) => SCALES[Math.min(l, SCALES.length - 1)];
const keepOf = (l) => (l < SCALES.length ? 1 : KEEPS[l - SCALES.length]);
/** GPU time of a frame at a level, for a machine that needs `base` ms at level 0 */
const gpuAt = (base, l) => base * (0.22 + 0.78 * scaleOf(l) ** 2) * Math.sqrt(keepOf(l));

/**
 * Run the governor for `seconds`. load(t) gives the GPU time at level 0 at time t (s).
 * timer: the GPU timer exists. cap: the browser never presents faster than this (ms).
 */
function run({ seconds, load, timer = true, cap = VSYNC, start = 0, landAt = -1 }) {
  const g = new Governor();
  g.level = start;
  let t = 0, frame = 0, slow = 0, frames = 0;
  const pending = [];
  const log = [];
  let rnd = 12345;
  const noise = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return (rnd / 0x7fffffff - 0.5) * 0.06; };
  while (t < seconds * 1000) {
    const gpu = gpuAt(load(t / 1000), g.level) * (1 + noise());
    const dt = Math.max(cap, Math.ceil((gpu + 2.5) / VSYNC) * VSYNC);
    t += dt; frame++;
    if (landAt >= 0 && t >= landAt * 1000) { landAt = -1; if (g.land()) log.push([t, g.level, g.reason]); }
    while (timer && pending.length && pending[0].at <= frame) { const p = pending.shift(); g.gpuSample(p.ms, p.level); }
    if (timer && frame % 4 === 0) pending.push({ at: frame + 2, ms: gpu, level: g.level });
    if (g.tick(dt, true)) log.push([t, g.level, g.reason]);
    if (t > 5000) { frames++; if (dt > 26.5) slow++; }
  }
  return { level: g.level, changes: log.length, log, slowShare: frames ? slow / frames : 0, gpu: gpuAt(load(seconds), g.level) };
}

let ok = true;
const check = (name, cond, r) => {
  ok = ok && cond;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}  [level ${r.level}, ${r.changes} changes, GPU ${r.gpu.toFixed(1)} ms, ${(r.slowShare * 100).toFixed(0)} % slow frames after 5 s]`);
  if (!cond) for (const [t, l, why] of r.log) console.log(`       ${(t / 1000).toFixed(2)} s -> level ${l}: ${why}`);
};

/** the first level whose GPU time is under the 9 ms the governor aims for */
const best = (base) => { let l = 0; while (l < LEVELS - 1 && gpuAt(base, l) > 9) l++; return l; };
/** the first level that just holds 60 frames a second (what trying finds, without a timer) */
const holds = (base) => { let l = 0; while (l < LEVELS - 1 && gpuAt(base, l) + 2.5 > VSYNC) l++; return l; };
const fits = (level, base) => level >= holds(base) && level <= best(base) + 1;

for (const timer of [true, false]) {
  const how = timer ? 'with a GPU timer' : 'frame times only';
  let r = run({ seconds: 60, load: () => 1.2, timer });
  check(`strong GPU, ${how}: nothing changes`, r.level === 0 && r.changes === 0, r);

  // frame times only: the level is found by trying (down to the smallest scale, then back up until a climb fails)
  r = run({ seconds: 90, load: () => 30, timer });
  check(`weak GPU (30 ms at full scale), ${how}: settles between level ${holds(30)} (just holds 60 frames a second) and ${best(30) + 1}`,
    fits(r.level, 30) && r.changes <= (timer ? 4 : 9) && r.slowShare < (timer ? 0.02 : 0.06), r);

  r = run({ seconds: 60, load: () => 60, timer });
  check(`very weak GPU (60 ms at full scale), ${how}: ends on the lowest levels without oscillating`, r.level >= SCALES.length - 1 && r.changes <= 8, r);

  r = run({ seconds: 120, load: (t) => (t < 30 ? 30 : 9), timer });
  // (it stops a little short of the best level on purpose: it climbs only while there is clear room)
  check(`weak GPU, then a room three times lighter, ${how}: quality comes back`, r.level <= 3 && r.changes <= 12 && r.slowShare < 0.06, r);

  r = run({ seconds: 120, load: () => 2, timer, cap: 33.4 });
  check(`a browser capped at 30 frames a second, GPU idle, ${how}: the level is given back and left alone`, r.level === 0 && r.changes <= (timer ? 0 : 4), r);
}

// the intro costs 2.2 times a frame of the run; the camera lands after 2.5 s
let r = run({ seconds: 30, load: (t) => (t < 2.5 ? 30 * 2.2 : 30), start: 6, landAt: 2.6 });
check(`weak GPU through the intro (started low): between level ${holds(30)} and ${best(30) + 1} after landing, then holds`,
  fits(r.level, 30) && r.slowShare < 0.02 && r.changes <= 6, r);

console.log(ok ? 'ALL PASS' : 'SOME SCENARIOS FAILED');
console.log(`(${LEVELS} levels: scales ${SCALES.join(', ')}; then thinning ${KEEPS.join(', ')})`);
process.exit(ok ? 0 : 1);
