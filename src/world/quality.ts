// Adaptive quality: the run must not keep dropping frames on a machine with a weak GPU.
// The cost of a frame is almost all fill (every Gaussian is a blended quad), so the lever is the
// number of pixels: the render scale goes down in small steps while the frame time stays over
// budget, and comes back up only when there is room and the camera is moving. Past the smallest
// scale, the Gaussians that tile surfaces are thinned. Steps are small and soft Gaussians hide them.

/** render scale of each level, relative to the device pixel ratio the page would use at best */
export const SCALES = [1, 0.87, 0.76, 0.66, 0.57, 0.5, 0.44];
/** share of the surface Gaussians kept, for the levels past the last scale */
export const KEEPS = [0.8, 0.62];
export const LEVELS = SCALES.length + KEEPS.length;

// ms of GPU time per frame. The page needs the GPU for more than the canvas (the browser composites the
// canvas and the type on the same GPU), so the budget leaves a third of a 60 Hz frame free: measured on an
// Intel UHD, frames start to slip from about 11 ms.
const GPU_HIGH = 11.0;  // over this, 60 frames a second are at risk
const GPU_GOAL = 9.0;   // a step down aims under this
const GPU_LOW = 5.8;    // under this there is room to go back up
const SLOW = 26.5;      // ms: a frame that missed 60 Hz by more than half a frame
const FILL = 0.78;      // share of the GPU time that scales with the number of pixels (measured: 0.75 to 0.85)

export type Tier = 'software' | 'weak' | 'integrated' | 'strong' | 'unknown';

/**
 * What the GPU says it is. megapixels: the pixels the canvas may start the run with.
 * intro: the share of that budget the intro gets. Seen from above while it is trained, the whole scene
 * is in view and a frame costs about twice a frame of the run (measured on an Intel UHD: 24 ms against
 * 11 ms): a weak GPU starts the intro lower and takes the difference back when the camera lands.
 */
export function deviceTier(renderer: string): { tier: Tier; megapixels: number; intro: number } {
  const r = renderer || '';
  if (/swiftshader|llvmpipe|software|basic render|softpipe/i.test(r)) return { tier: 'software', megapixels: 0.35, intro: 0.5 };
  if (/nvidia|geforce|quadro|rtx|gtx|radeon (rx|pro)|radeon rx|\barc\b.*a\d{3}|apple m\d|apple gpu/i.test(r)) return { tier: 'strong', megapixels: 4.2, intro: 1 };
  if (/iris|radeon\(tm\) graphics|radeon graphics|vega|\barc\b/i.test(r)) return { tier: 'integrated', megapixels: 1.7, intro: 0.55 };
  if (/intel|uhd|hd graphics|mali|adreno|powervr|videocore/i.test(r)) return { tier: 'weak', megapixels: 1.25, intro: 0.4 };
  return { tier: 'unknown', megapixels: 2.4, intro: 0.7 };
}

/** the render scale that costs the same as a level (thinning counts as a smaller scale) */
const cost = (level: number) => (level < SCALES.length ? SCALES[level] : SCALES[SCALES.length - 1] * Math.pow(KEEPS[level - SCALES.length], 0.25));

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
  private upWait = 2500;  // ms to wait before a climb; grows each time a climb does not hold
  private lastUp = -1;    // level we last climbed to, to notice a climb that did not hold
  private landing = 0;    // ms left of the moment after the intro, when the level may be reconsidered at once
  private blind = { from: -1, frameMs: 0, steps: 0 };
  private locked = 0;     // ms during which frame times alone may not lower the level
  private runLevel = 0;   // the level the pixel budget gives the run (the intro starts lower)
  /** false while a level is pinned (the overlay, tests) */
  auto = true;

  get scale() { return SCALES[Math.min(this.level, SCALES.length - 1)]; }
  get keep() { return this.level < SCALES.length ? 1 : KEEPS[this.level - SCALES.length]; }

  /** first level that fits the pixel budget of the device; the intro gets a share of that budget */
  start(pixels: number, megapixels: number, intro = 1) {
    const fit = (mp: number, last: number) => {
      const want = Math.sqrt((mp * 1e6) / Math.max(1, pixels));
      let l = 0;
      while (l < last && cost(l) > want * 1.04) l++;
      return l;
    };
    this.runLevel = fit(megapixels, SCALES.length - 1);
    this.level = fit(megapixels * intro, LEVELS - 1);
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
    // the first frames carry uploads and shader compilation: they say nothing about the run
    if (!(ms > 0.02) || level !== this.level || this.frames < 30) return;
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
   * The intro is over: the scene seen from above while it is trained costs more than the run does,
   * so whatever was lost there may be taken back at once (the camera is still landing: nothing shows).
   */
  land(): boolean {
    this.landing = 1800;
    this.since = Math.max(this.since, this.upWait);
    this.calm = Math.max(this.calm, 1500);
    const timer = this.gpuN >= 3;
    this.gpuN = 0; this.gpuOver = 0; // what was measured during the intro does not describe the run
    // without a GPU timer nothing says how much room there is: go to the level the device was given
    if (this.auto && !timer && this.level > this.runLevel) return this.set(this.runLevel, 'run');
    return false;
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
    if (this.landing > 0) { this.landing -= dt; moving = true; }
    if (this.frames < 36) return false;
    const isSlow = dt > SLOW;
    this.calm = isSlow ? 0 : this.calm + dt;
    this.window++; if (isSlow) this.slow++;
    const timer = this.gpuN >= 3;
    const floor = LEVELS - 1;

    if (timer) {
      // the GPU says how long a frame takes: decide on that
      if (this.gpuOver >= 3 && this.gpuMs > GPU_HIGH && this.since > 300 && this.level < floor) {
        // down, by as many levels as it takes to get under the goal, three at most in one go
        let to = this.level + 1;
        while (to < Math.min(floor, this.level + 3) && this.predict(to) > GPU_GOAL) to++;
        if (this.lastUp >= 0 && this.lastUp >= this.level) { this.failedUp++; this.upWait = Math.min(60000, this.upWait * 2.5); }
        this.lastUp = -1;
        return this.set(to, `GPU ${this.gpuMs.toFixed(1)} ms`);
      }
      // up, to the best level that still leaves a margin: three at most in one go. Right after the intro the
      // level may be reconsidered freely: any number of levels, and a thinner margin.
      const landing = this.landing > 0;
      if (this.level > 0 && moving && (landing || this.gpuMs < GPU_LOW) && this.since > this.upWait && this.calm > 1500) {
        let to = this.level;
        const span = landing ? LEVELS : 3, room = GPU_GOAL * (landing ? 0.97 : 0.85);
        while (to > Math.max(0, this.level - span) && this.predict(to - 1) < room) to--;
        if (to < this.level) {
          this.lastUp = to;
          return this.set(to, `room: GPU ${this.gpuMs.toFixed(1)} ms`);
        }
      }
    } else {
      // No timer (Firefox, Safari): frame times only. They cannot tell a slow GPU from a browser that caps
      // the page at 30 frames a second, and they come in steps of a refresh interval: a smaller picture may
      // not show in them until it is much smaller. So the scale goes down, two levels at a time while nearly
      // every frame is slow, to the smallest one before anything is judged. If the frames are no shorter
      // there, it was never the GPU: everything is taken back and frame times are no longer trusted.
      if (this.window >= 40) {
        const share = this.slow / this.window;
        this.slow = 0; this.window = 0;
        if (share > 0.3 && this.locked <= 0 && this.since > 500) {
          const last = SCALES.length - 1;
          if (this.blind.from < 0) this.blind = { from: this.level, frameMs: this.frameMs, steps: 0 };
          if (this.level >= last && this.blind.from < last && this.frameMs > this.blind.frameMs * 0.88) {
            const back = this.blind.from;
            this.blind = { from: -1, frameMs: 0, steps: 0 };
            this.locked = 600000;
            return this.set(back, 'not the GPU');
          }
          if (this.level < floor) {
            // a climb that did not hold is taken back, one level, and the next one waits longer
            const failed = this.lastUp >= 0 && this.lastUp >= this.level;
            if (failed) { this.failedUp++; this.upWait = Math.min(120000, this.upWait * 3); }
            this.lastUp = -1;
            const step = !failed && share > 0.7 && this.level + 2 <= last ? 2 : 1;
            return this.set(this.level + step, `${Math.round(share * 100)}% slow frames`);
          }
        }
        if (share < 0.05) this.blind = { from: -1, frameMs: 0, steps: 0 };
      }
      if (this.level > 0 && moving && this.failedUp < 2 && this.since > Math.max(8000, this.upWait * 3) && this.calm > 8000) {
        this.lastUp = this.level - 1;
        return this.set(this.level - 1, 'stable');
      }
    }
    return false;
  }

  /** pin a level (the overlay, tests) */
  force(level: number) { this.auto = false; this.set(level, 'forced'); }
}
