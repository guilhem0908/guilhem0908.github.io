// Adaptive quality: the run must not keep dropping frames on a machine with a weak GPU.
// The cost of a frame is almost all fill (every Gaussian is a blended quad), so the lever is the
// number of pixels: the render scale goes down in small steps while the frame time stays over
// budget, and comes back up only after a long stable stretch. Past the smallest scale, the
// Gaussians that tile surfaces are thinned. Steps are small and soft Gaussians hide them.

/** render scale of each level, relative to the device pixel ratio the page would use at best */
export const SCALES = [1, 0.87, 0.76, 0.66, 0.57, 0.5, 0.44];
/** share of the surface Gaussians kept, for the levels past the last scale */
export const KEEPS = [0.8, 0.62];
export const LEVELS = SCALES.length + KEEPS.length;

const GPU_HIGH = 12.5;  // ms of GPU time per frame: over this, 60 frames a second are at risk
const GPU_GOAL = 10.0;  // a step down aims under this
const GPU_LOW = 6.5;    // under this there is room to go back up
const SLOW = 26.5;      // ms: a frame that missed 60 Hz by more than half a frame
const FILL = 0.78;      // share of the GPU time that scales with the number of pixels (measured: 0.75 to 0.85)

export type Tier = 'software' | 'weak' | 'integrated' | 'strong' | 'unknown';

/** megapixels the canvas may start with, from what the GPU says it is */
export function deviceTier(renderer: string): { tier: Tier; megapixels: number } {
  const r = renderer || '';
  if (/swiftshader|llvmpipe|software|basic render|softpipe/i.test(r)) return { tier: 'software', megapixels: 0.35 };
  if (/nvidia|geforce|quadro|rtx|gtx|radeon (rx|pro)|radeon rx|\barc\b.*a\d{3}|apple m\d|apple gpu/i.test(r)) return { tier: 'strong', megapixels: 4.2 };
  if (/iris|radeon\(tm\) graphics|radeon graphics|vega|\barc\b/i.test(r)) return { tier: 'integrated', megapixels: 1.7 };
  if (/intel|uhd|hd graphics|mali|adreno|powervr|videocore/i.test(r)) return { tier: 'weak', megapixels: 1.25 };
  return { tier: 'unknown', megapixels: 2.4 };
}

export class Governor {
  level = 0;
  /** moving average of the frame interval (ms) */
  frameMs = 16.7;
  /** moving average of the GPU time of a frame (ms), -1 until the timer has answered */
  gpuMs = -1;
  /** why the level last changed, for the overlay */
  reason = 'start';
  changes = 0;
  private frames = 0;
  private slow = 0;
  private window = 0;
  private since = 0;      // ms since the last change
  private calm = 0;       // ms without a slow frame
  private gpuN = 0;
  private gpuOver = 0;
  private failedUp = 0;
  private upWait = 6000;
  private lastUp = -1;    // level we last climbed to, to notice a climb that did not hold
  private blind = { from: -1, frameMs: 0, steps: 0 };
  private locked = 0;     // ms during which frame times alone may not lower the level

  constructor(public auto = true) {}

  get scale() { return SCALES[Math.min(this.level, SCALES.length - 1)]; }
  get keep() { return this.level < SCALES.length ? 1 : KEEPS[this.level - SCALES.length]; }

  /** first level whose scale fits the pixel budget of the device */
  start(pixels: number, megapixels: number) {
    const want = Math.sqrt((megapixels * 1e6) / Math.max(1, pixels));
    let l = 0;
    while (l < SCALES.length - 1 && SCALES[l] > want * 1.04) l++;
    this.level = l;
    this.reason = 'device';
  }

  private set(level: number, reason: string): boolean {
    level = Math.max(0, Math.min(LEVELS - 1, level));
    if (level === this.level) return false;
    if (this.gpuMs > 0) this.gpuMs = this.predict(level); // until the timer answers at the new level
    this.level = level; this.reason = reason; this.changes++;
    this.since = 0; this.slow = 0; this.window = 0; this.gpuOver = 0; this.calm = 0;
    return true;
  }

  /** GPU time of one frame, measured at a given level (results arrive a few frames late) */
  gpuSample(ms: number, level: number) {
    if (!(ms > 0.02) || level !== this.level) return;
    this.gpuMs = this.gpuN++ ? this.gpuMs + (ms - this.gpuMs) * 0.3 : ms;
    this.gpuOver = ms > GPU_HIGH ? this.gpuOver + 1 : 0;
  }

  /** what the GPU time would be at another level, from the time at this one */
  private predict(to: number) {
    const a = SCALES[Math.min(this.level, SCALES.length - 1)], b = SCALES[Math.min(to, SCALES.length - 1)];
    let k = 1 - FILL + FILL * (b * b) / (a * a);
    const ka = this.level < SCALES.length ? 1 : KEEPS[this.level - SCALES.length];
    const kb = to < SCALES.length ? 1 : KEEPS[to - SCALES.length];
    k *= Math.sqrt(kb / ka);
    return this.gpuMs * k;
  }

  /**
   * Once per rendered frame. `moving`: the camera is travelling, so a change of sharpness cannot be seen.
   * Returns true when the level changed.
   */
  tick(dt: number, moving: boolean): boolean {
    if (!this.auto) return false;
    if (dt > 250 || dt <= 0) { this.slow = 0; this.window = 0; return false; } // a tab switch, a hitch: not a trend
    this.frames++;
    this.frameMs += (dt - this.frameMs) * 0.06;
    this.since += dt;
    if (this.locked > 0) this.locked -= dt;
    if (this.frames < 24) return false;
    const isSlow = dt > SLOW;
    this.calm = isSlow ? 0 : this.calm + dt;
    this.window++; if (isSlow) this.slow++;
    const timer = this.gpuN >= 3;

    if (timer) {
      // the GPU says how long a frame takes: decide on that, frame times only confirm
      if (this.gpuOver >= 3 && this.gpuMs > GPU_HIGH && this.since > 350) {
        let to = this.level + 1;
        while (to < LEVELS - 1 && this.predict(to) > GPU_GOAL) to++;
        if (this.lastUp === this.level) { this.failedUp++; this.upWait = Math.min(60000, this.upWait * 2.5); }
        this.lastUp = -1;
        return this.set(to, `GPU ${this.gpuMs.toFixed(1)} ms`);
      }
      if (this.level > 0 && moving && this.gpuMs < GPU_LOW && this.since > this.upWait && this.calm > 3000 && this.predict(this.level - 1) < GPU_GOAL * 0.92) {
        this.lastUp = this.level - 1;
        return this.set(this.level - 1, 'headroom');
      }
    } else {
      // no timer (Firefox, Safari): frame times only. They cannot tell a slow GPU from a browser that
      // caps the page at 30 frames a second, so a step that does not help is taken back.
      if (this.window >= 40) {
        const share = this.slow / this.window;
        this.slow = 0; this.window = 0;
        if (share > 0.3 && this.locked <= 0 && this.since > 600 && this.level < LEVELS - 1) {
          if (this.blind.from < 0) this.blind = { from: this.level, frameMs: this.frameMs, steps: 0 };
          this.blind.steps++;
          if (this.blind.steps > 2 && this.frameMs > this.blind.frameMs * 0.88) {
            const back = this.blind.from;
            this.blind = { from: -1, frameMs: 0, steps: 0 };
            this.locked = 45000;
            return this.set(back, 'not the GPU');
          }
          if (this.lastUp === this.level) { this.failedUp++; this.upWait = Math.min(120000, this.upWait * 3); }
          this.lastUp = -1;
          return this.set(this.level + 1, `${Math.round(share * 100)}% slow frames`);
        }
        if (share < 0.05) this.blind = { from: -1, frameMs: 0, steps: 0 };
      }
      if (this.level > 0 && moving && this.failedUp < 2 && this.since > this.upWait * 2 && this.calm > 10000) {
        this.lastUp = this.level - 1;
        return this.set(this.level - 1, 'stable');
      }
    }
    return false;
  }

  /** pin a level (the overlay, tests) */
  force(level: number) { this.auto = false; this.set(level, 'forced'); }
}
